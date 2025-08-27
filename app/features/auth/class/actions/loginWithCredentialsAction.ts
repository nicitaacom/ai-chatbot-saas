"use server"

import argon2 from "argon2"
import jwt from "jsonwebtoken"

import { User } from "@/ts/namespaces/supabase"
import { TLocaleTag } from "@/ts/types/TLocaleTag"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { validateEmail } from "../../functions/validateEmail"
import { validatePassword } from "../../functions/validatePassword"
import { setCookie } from "@/utils/helpersSSR"
import { getCurrentLocale, getI18n } from "@/locales/server"

export async function loginWithCredentialsAction(email: string, password: string, isRememberMe: boolean) {
  const locale = await getCurrentLocale()
  const t = await getI18n()

  // Validate that the locale is supported, fallback to 'en' if not
  const localeSupport: Record<TLocaleTag, boolean> = { en: true, lv: true }
  const isLocaleSupported = (loc: string): loc is TLocaleTag => loc in localeSupport && localeSupport[loc as TLocaleTag]
  const validLocale: TLocaleTag = isLocaleSupported(locale) ? locale : "en"

  // 0. Validate on server side as well to prevent man-in-the-middle attack
  const emailValidation = validateEmail(email, validLocale)
  if (typeof emailValidation === "string") return emailValidation

  // Note: validatePassword is async, so we need to await it
  const passwordValidation = await validatePassword(password, [email.split("@")[0]], validLocale)
  if (typeof passwordValidation === "string") return passwordValidation

  // 1. Fetch user record
  const { data: user, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()
  if (error) return t("auth.database.error_finding_user", { message: error.message })
  if (!user) return t("auth.database.user_not_registered")
  if (user && !user.email_verified_at && user.verification_email_sent_at) return t("auth.register.user_exist_email_not_confirmed")
  if (!user.encrypted_password) return t("auth.database.email_not_registered_with_credentials")

  // 2. Pepper check
  const pepper = process.env.PASSWORD_SECRET
  if (!pepper) return t("auth.server.missing_password_secret")

  // 3. Verify password using pepper+argon2
  const valid = await argon2.verify(user.encrypted_password, `${pepper}:${password}`)
  if (!valid) return t("auth.database.invalid_credentials")

  const constructedUser: User = { user: user, session: null }
  const token = jwt.sign(constructedUser, process.env.JWT_SECRET, { expiresIn: "1h" })

  // Set cookie with default 1-hour expiration (or customize as needed)
  const monthInSeconds = 60 * 60 * 24 * 30
  setCookie("auth_token", token, isRememberMe ? monthInSeconds : 3600)

  return constructedUser
}
