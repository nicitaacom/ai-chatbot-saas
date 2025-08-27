"use server"

/**
 * registerWithCredentialsAction
 *
 * Flow:
 * // 1. validate input & envs
 * // 2. ensure user doesn't already have "credentials"
 * // 3. reuse mapping if exists else create new verify:{id} payload
 * // 4. set redis keys with TTL using setKeyWithTTL helper (set -> expire)
 * // 5. send verification email, update mapping (count/lastSent)
 *
 * Note: setKeyWithTTL revokes key on partial failure to avoid stale state.
 */

import { nanoid } from "nanoid"
import jwt from "jsonwebtoken"
import { resend } from "@/libs/resend"
import { renderVerifyEmailString } from "../../functions/renderVerifyEmailString"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { validateEmail } from "../../functions/validateEmail"
import { validatePassword } from "../../functions/validatePassword"
import { getCurrentLocale, getI18n } from "@/locales/server"
import { TLocaleTag } from "@/ts/types/TLocaleTag"
import { redis } from "@/libs/redis"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { encryptPassword24 } from "../../functions/encryptPassword24"
import { funnyUsernames } from "../../consts/funnyUsernames"
import moment from "moment-timezone"

const VERIFICATION_TTL = 60 * 60 * 24
const RESEND_COOLDOWN_SECONDS = 60
const MAX_RESENDS = 2
const VERIFY_EMAIL_KEY_PREFIX = "verify_email:"
const VERIFY_ID_KEY_PREFIX = "verify:"

/**
 * Set a key + TTL, revoke on any partial failure (concise, atomic-ish).
 * - uses set then expire because client typings don't accept EX option.
 */
const setKeyWithTTL = async (key: string, value: string, ttlSec: number) =>
  await redis
    .set(key, value)
    .catch(async err => {
      await redis.del(key).catch(() => void 0)
      throw err
    })
    .then(
      async () =>
        await redis.expire(key, ttlSec).catch(async err => {
          await redis.del(key).catch(() => void 0)
          throw err
        }),
    )

export async function registerWithCredentialsAction(
  email: string,
  password: string,
  confirmPassword?: string,
): Promise<[string] | string> {
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

  // 3. envs
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return t("auth.server.missing_jwt_secret")
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL
  if (!supportEmail) return t("auth.server.missing_support_email")

  const normalizedEmail = email.toLowerCase().trim()

  // 4. existing user check
  const { data: existingUser, error: checkError } = await supabaseAdmin
    .from("users")
    .select("id,email,providers,email_verified_at")
    .eq("email", normalizedEmail)
    .single()
  if (checkError && checkError.code !== "PGRST116") return t("auth.database.error_finding_user", { message: checkError.message })
  if (existingUser && existingUser.providers?.includes("credentials") && existingUser.email_verified_at)
    return t("auth.register.user_already_exists")
  if (existingUser && existingUser.providers?.includes("credentials") && !existingUser.email_verified_at)
    return t("auth.register.user_exist_email_not_confirmed")

  // 5. mapping lookup
  const emailKey = `${VERIFY_EMAIL_KEY_PREFIX}${normalizedEmail}`
  let mapping: { id: string; lastSent: number; count: number } | null = null
  try {
    const rawMap = await redis.get(emailKey)
    mapping = rawMap ? (JSON.parse(rawMap as string) as { id: string; lastSent: number; count: number }) : null
  } catch (err) {
    console.error("redis.get mapping error:", err)
    mapping = null
  }

  const now = Math.floor(Date.now() / 1000)
  let id = mapping?.id
  let verifyKey = id ? `${VERIFY_ID_KEY_PREFIX}${id}` : null
  let verifyPayloadExists = false

  // 6. check verify:{id} payload presence
  if (id) {
    try {
      const maybe = await redis.get(verifyKey!)
      verifyPayloadExists = !!maybe
    } catch (err) {
      console.error("redis.get verify payload error:", err)
      verifyPayloadExists = false
    }
  }

  // 7. create or reuse payload + mapping (concise)
  if (!mapping || !verifyPayloadExists) {
    id = nanoid(64)
    verifyKey = `${VERIFY_ID_KEY_PREFIX}${id}`
    const encryptedPassword = await encryptPassword24(password)
    if (typeof encryptedPassword === "string") throw Error(t("auth.server.error_encrypting_password"))
    const raw = JSON.stringify({ email: normalizedEmail, encryptedPassword: encryptedPassword[0] })
    // set verify:{id} with TTL (set then expire), revoke on failure
    await setKeyWithTTL(verifyKey, raw, VERIFICATION_TTL).catch(err => {
      console.error("setKeyWithTTL error:", err)
      throw err
    })
    mapping = { id, lastSent: now, count: 1 }
  } else {
    // mapping exists & payload exists -> handle resend/cooldown
    const age = now - (mapping.lastSent || 0)
    if (age < RESEND_COOLDOWN_SECONDS) {
      if ((mapping.count || 0) >= MAX_RESENDS) {
        const wait = RESEND_COOLDOWN_SECONDS - age
        return t("auth.register.resend_rate_limited", { seconds: String(wait) })
      }
      mapping.count = (mapping.count || 0) + 1
      mapping.lastSent = now
    } else {
      mapping.count = 1
      mapping.lastSent = now
    }
    // overwrite verify payload with latest password + reset TTL (concise)
    const raw = JSON.stringify({ email: normalizedEmail, password })
    await setKeyWithTTL(verifyKey!, raw, VERIFICATION_TTL).catch(err => {
      console.error("setKeyWithTTL overwrite error:", err)
      throw err
    })
  }

  // 8. build verification link and send email
  const token = jwt.sign({ id, type: "email_verification" }, jwtSecret, { expiresIn: "24h" })
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}&lngTag=${locale}`
  try {
    const rateLimit = new Ratelimit({
      redis: Redis.fromEnv(), // it takes UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
      limiter: Ratelimit.slidingWindow(2, "2m"),
    })
    const { remaining } = await rateLimit.getRemaining("email:verify")
    if (remaining === 0) throw Error("Email already has been sent - please wait")

    await rateLimit.limit("email:verify")
    await resend.emails.send({
      to: normalizedEmail,
      from: supportEmail,
      subject: "Register on AI chatbot - verify your email",
      html: renderVerifyEmailString(verificationUrl, "", normalizedEmail),
    })
  } catch (sendErr) {
    console.error("resend send error:", sendErr)
    // optimistic revoke: delete verifyKey & mapping in one-liners
    if (verifyKey) await redis.del(verifyKey).catch(() => void 0)
    await redis.del(emailKey).catch(() => void 0)
    return t("auth.database.supabase_error", { message: (sendErr as any)?.message ?? "send_failed" })
  }

  const username = funnyUsernames[Math.floor(Math.random() * funnyUsernames.length)]
  const { error } = await supabaseAdmin.from("users").insert({
    id: nanoid(32),
    email: normalizedEmail,
    username,
    roles: ["USER"],
    providers: ["credentials"],
    is_otp_enabled: false,
    verification_email_sent_at: moment().toISOString(),
  })
  if (error) return t("auth.register.insert_new_user_failed", { message: error.message })

  // 9. persist mapping with TTL (set then expire), best-effort
  try {
    await setKeyWithTTL(emailKey, JSON.stringify(mapping), VERIFICATION_TTL)
  } catch (err) {
    console.error("persist mapping error:", err)
  }

  // 10. done
  return [t("auth.register.email_confirmation_required")]
}
