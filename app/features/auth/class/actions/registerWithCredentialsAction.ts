"use server"

import argon2 from "argon2"
import jwt from "jsonwebtoken"

import { resend } from "@/libs/resend"
import supabaseAdmin from "@/libs/supabaseAdmin"
import supabaseServer from "@/libs/supabaseServer"
import { renderVerifyEmailString } from "../../functions/renderVerifyEmailString"
import { IDBUser, User } from "@/ts/namespaces/supabase"
import { TLocaleTag } from "@/ts/types/TLocaleTag"
import { validateEmail } from "../../functions/validateEmail"
import { validatePassword } from "../../functions/validatePassword"
import { setCookie } from "@/utils/helpersSSR"
import { getCurrentLocale, getI18n } from "@/locales/server"

export async function registerWithCredentialsAction(email: string, password: string, confirmPassword?: string) {
  const locale = await getCurrentLocale()
  const t = await getI18n()

  // 1. locale check
  const localeSupport: Record<TLocaleTag, boolean> = { en: true, lv: true }
  const isLocaleSupported = (loc: string): loc is TLocaleTag => loc in localeSupport && localeSupport[loc as TLocaleTag]
  const validLocale: TLocaleTag = isLocaleSupported(locale) ? locale : "en"

  // 2. basic validation
  const emailValidation = validateEmail(email, validLocale)
  if (typeof emailValidation === "string") return emailValidation
  const passwordValidation = await validatePassword(password, [email.split("@")[0]], validLocale)
  if (typeof passwordValidation === "string") return passwordValidation
  if (confirmPassword && password !== confirmPassword) return t("auth.register.password_mismatch")

  // 3. env checks
  const pepper = process.env.PASSWORD_SECRET
  if (!pepper) return t("auth.server.missing_password_secret")
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return t("auth.server.missing_jwt_secret")

  // 4. existing user check
  const { data: existingUser, error: checkError } = await supabaseAdmin.from("users").select("*").eq("email", email).single()
  if (checkError && checkError.code !== "PGRST116") return t("auth.database.error_finding_user", { message: checkError.message })
  if (existingUser && existingUser.providers?.includes("credentials")) return t("auth.register.user_already_exists")

  // 5. hash with pepper
  const hashedPassword = await argon2
    .hash(`${pepper}:${password}`, { type: argon2.argon2id, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1 })
    .catch(() => null)
  if (!hashedPassword) return t("auth.register.password_hashing_failed")

  // 6. create supabase auth user
  const { data: signUpData, error: signUpError } = await supabaseServer().auth.signUp({ email, password })
  if (signUpError) return t("auth.database.supabase_error", { message: signUpError.message })
  if (!signUpData?.user) return t("auth.database.no_user")
  const newUserRecord: IDBUser = {
    id: signUpData.user.id,
    email: email.toLowerCase().trim(),
    encrypted_password: hashedPassword,
    providers: ["credentials"],
    email_verified_at: signUpData.user.email_confirmed_at,
    created_at: new Date().toISOString(),
    roles: ["USER"],
    username: "",
    is_otp_enabled: false,
  }

  // 7. insert or update DB row (cleanup on error)
  let dbUser: IDBUser | null = null
  if (existingUser) {
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update(newUserRecord)
      .eq("email", email)
      .select()
      .single()
    if (updateError) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id)
      if (delError) console.error(77, "cleanup error", delError.message)
      return t("auth.database.error", { message: updateError.message })
    }
    dbUser = updatedUser
  } else {
    const { data: insertedUser, error: insertError } = await supabaseAdmin.from("users").insert([newUserRecord]).select().single()
    if (insertError) {
      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id)
      if (delError) console.error(86, "cleanup error", delError.message)
      return t("auth.database.error", { message: insertError.message })
    }
    dbUser = insertedUser
  }
  if (!dbUser) return t("auth.database.no_user")

  // 8. create email verification token & send verification email via Resend
  const verificationToken = jwt.sign({ sub: dbUser.id, email, type: "email_verification" }, jwtSecret, { expiresIn: "24h" })
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "" // it's http://localhost:3000 in dev
  const verificationUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/verify?token=${verificationToken}`
  const { error } = await resend.emails.send({
    to: email,
    from: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@yourdomain.com",
    subject: "Register on AI chatbot - verify your email",
    html: renderVerifyEmailString(verificationUrl, dbUser.username || ""),
  })
  if (error) return error.message

  // 9. session will exist because email confirmation is happening under the hood - not with supabase
  if (signUpData.session) {
    const constructedUser: User = { user: dbUser, session: signUpData.session }
    const jwtToken = jwt.sign(constructedUser, jwtSecret, { expiresIn: "1h" })
    setCookie("auth_token", jwtToken)
    return constructedUser
  }

  // 10. otherwise require email confirmation
  return [t("auth.register.email_confirmation_required")]
}
