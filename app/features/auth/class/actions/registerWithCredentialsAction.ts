"use server"

import crypto from "crypto"
import { Redis } from "@upstash/redis"
import jwt from "jsonwebtoken"
import { resend } from "@/libs/resend"
import { renderVerifyEmailString } from "../../functions/renderVerifyEmailString"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { validateEmail } from "../../functions/validateEmail"
import { validatePassword } from "../../functions/validatePassword"
import { getCurrentLocale, getI18n } from "@/locales/server"
import { TLocaleTag } from "@/ts/types/TLocaleTag"

const VERIFICATION_TTL = 60 * 60 * 24 // 24h

/**
 * registerWithCredentialsAction
 *
 * Flow:
 * 1. validate input
 * 2. ensure user doesn't already have "credentials" provider
 * 3. store plaintext {email,password} in Upstash Redis under key `verify:{id}` (ttl 24h)
 * 4. sign small JWT referencing that id (no plaintext in token)
 * 5. send verification email with Resend to /api/auth/verify?token=...
 *
 * Note: we DO NOT create a Supabase Auth user here. creation happens only after verification.
 */
export async function registerWithCredentialsAction(
  email: string,
  password: string,
  confirmPassword?: string,
): Promise<string | [string]> {
  // 1. i18n + locale
  const locale = await getCurrentLocale()
  const t = await getI18n()
  const localeSupport: Record<TLocaleTag, boolean> = { en: true, lv: true }
  const isLocaleSupported = (loc: string): loc is TLocaleTag => loc in localeSupport && localeSupport[loc as TLocaleTag]
  const validLocale: TLocaleTag = isLocaleSupported(locale) ? locale : "en"

  // 2. validation
  const emailValidation = validateEmail(email, validLocale)
  if (typeof emailValidation === "string") return emailValidation
  const pwValidation = await validatePassword(password, [email.split("@")[0]], validLocale)
  if (typeof pwValidation === "string") return pwValidation
  if (confirmPassword && password !== confirmPassword) return t("auth.register.password_mismatch")

  // 3. env checks
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return t("auth.server.missing_jwt_secret")
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL
  if (!supportEmail) return t("auth.server.missing_support_email")

  const normalizedEmail = email.toLowerCase().trim()

  // 4. existing user check (if credentials already present -> error)
  const { data: existingUser, error: checkError } = await supabaseAdmin
    .from("users")
    .select("id,email,providers")
    .eq("email", normalizedEmail)
    .single()
  console.log(61, "existingUser - ", existingUser)
  if (checkError && checkError.code !== "PGRST116") return t("auth.database.error_finding_user", { message: checkError.message })
  if (existingUser && existingUser.providers?.includes("credentials")) return t("auth.register.user_already_exists")

  // 5. create Redis verification record (plaintext password stored temporarily)
  const redis = Redis.fromEnv()
  const id = crypto.randomUUID()
  const key = `verify:${id}`
  const raw = JSON.stringify({ email: normalizedEmail, password })
  try {
    const ok = await redis.set(key, raw, { ex: VERIFICATION_TTL })
    console.log(72, "ok", ok)
    if (!ok) throw new Error("redis_set_failed")
  } catch (err) {
    console.error("redis set error:", err)
    return t("auth.server.cannot_store_verification")
  }

  // 6. sign verification JWT referencing the redis key id (no plaintext inside)
  const token = jwt.sign({ id, type: "email_verification" }, jwtSecret, { expiresIn: "24h" })
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`

  // 7. send verification email
  try {
    const sendEmailResp = await resend.emails.send({
      to: normalizedEmail,
      from: supportEmail,
      subject: "Register on AI chatbot - verify your email",
      html: renderVerifyEmailString(verificationUrl, ""),
    })
    console.log(92, "sendEmailResp - ", sendEmailResp)
  } catch (sendErr) {
    console.error("resend send error:", sendErr)
    // cleanup redis if send failed
    await redis.del(key).catch(e => console.warn("redis.del failed", e))
    return t("auth.database.supabase_error", { message: (sendErr as any)?.message ?? "send_failed" })
  }

  // 8. done — require email confirmation
  return [t("auth.register.email_confirmation_required")]
}
