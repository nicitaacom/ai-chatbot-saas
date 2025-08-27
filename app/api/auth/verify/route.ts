// app/api/auth/verify/route.ts
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TLocaleTag } from "@/ts/types/TLocaleTag"
import { applyRateLimit } from "./functions/applyRateLimit"
import { verifyTokenGetId } from "./functions/verifyTokenGetId"
import { fetchVerifyRecord } from "./functions/fetchVerifyRecord"
import { decryptStoredPassword } from "./functions/decryptStoredPassword"
import { fetchExistingUser } from "./functions/fetchExistingUser"
import { deleteRedisKey } from "./functions/deleteRedisKey"
import { insertInUsers } from "./functions/insertInUsers"
import { signAndSetAuthCookie } from "./functions/signAndSetAuthCookie"

/**
 * /api/auth/verify route
 * - server-only: wrapped in `if (typeof window === "undefined") { ... }`
 * - uses small step functions from ./functions.ts (each returns [result] or string)
 *
 * Flow:
 * // 1. rate limit
 * // 2. verify token -> id
 * // 3. fetch verify:{id} record
 * // 4. decrypt password
 * // 5. re-check DB
 * // 6. insert/update users row
 * // 7. cleanup redis
 * // 8. sign + set cookie
 * // 9. return success redirect or json
 */

// --- translations (en|lv) + locale resolver (same as your preference) ---
const translations: Record<TLocaleTag, Record<string, string>> = {
  en: {
    "auth.server.missing_jwt_secret": "JWT secret missing - contact support",
    "auth.verify.missing_token": "Missing verification token",
    "auth.verify.invalid_or_expired_token": "Invalid or expired token - register one more time",
    "auth.verify.invalid_token_payload": "Invalid token payload",
    "auth.server.invalid_data": "Failed when getting stored verification",
    "auth.database.error_finding_user": "Error finding user in DB: {message}",
    "auth.verify.user_not_found": "User not found",
    "auth.verify.email_mismatch": "Token email does not match user email",
    "auth.register.user_already_exists": "An account with this email already exists",
    "auth.verify.already_verified": "Email already verified",
    "auth.verify.success": "Email verified successfully",
    "auth.server.error_decrypting_password": "Error decrypting password",
    "auth.server.rate_limit_reason": "Too many requests, please try later",
  },
  lv: {
    "auth.server.missing_jwt_secret": "Trūkst JWT noslēpuma — sazinieties ar atbalstu",
    "auth.verify.missing_token": "Trūkst apstiprinājuma tokena",
    "auth.verify.invalid_or_expired_token": "Nederīgs vai beidzies derīguma termiņš — reģistrējieties vēlreiz",
    "auth.verify.invalid_token_payload": "Nederīgs tokena saturs",
    "auth.server.invalid_data": "Neizdevās iegūt saglabāto apstiprinājumu",
    "auth.database.error_finding_user": "Kļūda meklējot lietotāju datu bāzē: {message}",
    "auth.verify.user_not_found": "Lietotājs nav atrasts",
    "auth.verify.email_mismatch": "Tokenā norādītais e-pasts neatbilst lietotāja e-pastam",
    "auth.register.user_already_exists": "Konts ar šo e-pastu jau pastāv",
    "auth.verify.already_verified": "E-pasts jau apstiprināts",
    "auth.verify.success": "E-pasts veiksmīgi apstiprināts",
    "auth.server.error_decrypting_password": "Kļūda atšifrējot paroli",
    "auth.server.rate_limit_reason": "Pārāk daudz pieprasījumu, mēģiniet vēlāk",
  },
}
type Keys = keyof (typeof translations)["en"]
function resolveLocale(req: NextRequest): TLocaleTag {
  try {
    const url = new URL(req.url)
    const q = (url.searchParams.get("lng") ?? url.searchParams.get("lngTag"))?.toLowerCase()
    if (q === "lv" || q === "en") return q as TLocaleTag
    const seg = url.pathname.split("/").filter(Boolean)[0]
    if (seg === "lv" || seg === "en") return seg as TLocaleTag
    const al = req.headers.get("accept-language") ?? ""
    if (al.startsWith("lv")) return "lv"
  } catch {}
  return "en"
}
function getT(locale: TLocaleTag) {
  const map = translations[locale] ?? translations.en
  return (key: Keys, vars?: Record<string, string>) => {
    let s = (map as any)[key] ?? key
    if (vars) for (const k of Object.keys(vars)) s = s.replace(new RegExp(`{${k}}`, "g"), vars[k])
    return s
  }
}

export async function GET(req: NextRequest) {
  // server-only guard
  if (typeof window !== "undefined")
    return NextResponse.json(
      { ok: false, message: "This is API route that allowed to be executed on server only" },
      { status: 400 },
    )

  // 0. locale + t()
  const locale = resolveLocale(req),
    t = getT(locale)

  // 1. env + headers
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return NextResponse.json({ message: t("auth.server.missing_jwt_secret") }, { status: 500 })

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const acceptHeader = headers().get("accept") ?? ""
  const preferHtml = acceptHeader.includes("text/html")
  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  // helpers
  const unwrapErr = (s: string) => (s.includes("::") ? s.split("::")[1] : s)
  const redirectAuthErr = (err: string) => NextResponse.redirect(`${baseUrl}/auth?error=${encodeURIComponent(err)}`)
  const redirectDashSuccess = (msg: string) => NextResponse.redirect(`${baseUrl}/dashboard?success=${encodeURIComponent(msg)}`)

  // 2. rate-limit (condensed)
  const rlRes = await applyRateLimit(ip)
  if (!rlRes.ok) {
    const reason = rlRes.reason ?? "rate_limited",
      retryAfterSec = typeof rlRes.reset === "number" ? Math.max(0, Math.floor((rlRes.reset - Date.now()) / 1000)) : undefined
    const err = rlRes.reason ?? t("auth.server.rate_limit_reason")
    return preferHtml
      ? redirectAuthErr(err)
      : NextResponse.json(
          { ok: false, reason, message: t("auth.server.rate_limit_reason"), retryAfter: retryAfterSec ?? null },
          { status: 429 },
        )
  }

  // 3. parse token (condensed)
  const url = new URL(req.url),
    token = url.searchParams.get("token")
  if (!token)
    return preferHtml
      ? redirectAuthErr(t("auth.verify.missing_token"))
      : NextResponse.json({ message: t("auth.verify.missing_token") }, { status: 400 })

  // 4. verify token -> id
  const idRes = await verifyTokenGetId(token, jwtSecret)
  if (typeof idRes === "string")
    return preferHtml
      ? redirectAuthErr(t(idRes as any))
      : NextResponse.json({ message: t(idRes as any) }, { status: idRes === "auth.verify.invalid_or_expired_token" ? 401 : 400 })
  const [id] = idRes

  // 5. fetch verify:{id}
  const recRes = await fetchVerifyRecord(id)
  if (typeof recRes === "string")
    return preferHtml
      ? redirectAuthErr(t(recRes as any))
      : NextResponse.json(
          { message: t(recRes as any) },
          { status: recRes === "auth.verify.invalid_or_expired_token" ? 401 : 500 },
        )
  const [{ email, encryptedPassword }] = recRes

  // 6. decrypt password (use directly later)
  const pwdRes = await decryptStoredPassword(encryptedPassword)
  if (typeof pwdRes === "string")
    return preferHtml ? redirectAuthErr(t(pwdRes as any)) : NextResponse.json({ message: t(pwdRes as any) }, { status: 500 })

  // 7. fetch existing user
  const existingRes = await fetchExistingUser(email)
  if (typeof existingRes === "string") {
    const msg = existingRes.startsWith("auth.database.error_finding_user::") ? unwrapErr(existingRes) : existingRes
    const errMsg = t("auth.database.error_finding_user").replace("{message}", msg)
    return preferHtml ? redirectAuthErr(errMsg) : NextResponse.json({ message: errMsg }, { status: 500 })
  }
  const [existingUser] = existingRes

  // 8. ensure not race-created with credentials
  if (existingUser && existingUser.providers?.includes("credentials") && existingUser.email_verified_at) {
    await deleteRedisKey(`verify:${id}`).catch(() => void 0)
    const msg = t("auth.register.user_already_exists")
    return preferHtml ? redirectAuthErr(msg) : NextResponse.json({ message: msg }, { status: 409 })
  }

  // 9. create/update user (use pwdRes[0] directly)
  const upsertRes = await insertInUsers(email, pwdRes[0], existingUser as any)
  if (typeof upsertRes === "string") {
    const err = unwrapErr(upsertRes)
    return preferHtml ? redirectAuthErr(err) : NextResponse.json({ message: err }, { status: 500 })
  }
  const [dbUser] = upsertRes

  // 10. cleanup redis
  await deleteRedisKey(`verify:${id}`).catch(() => void 0)

  // 11. sign + set cookie
  const tokenRes = await signAndSetAuthCookie({ user: dbUser, session: null })
  if (typeof tokenRes === "string") {
    const msg = t(tokenRes as any)
    return preferHtml ? redirectAuthErr(msg) : NextResponse.json({ message: msg }, { status: 500 })
  }

  // 12. success -> redirect to dashboard or return json
  const user = { id: dbUser.id, email: dbUser.email, email_verified_at: dbUser.email_verified_at }
  const successMsg = t("auth.verify.success")
  return preferHtml ? redirectDashSuccess(successMsg) : NextResponse.json([{ message: successMsg, user }], { status: 200 })
}
