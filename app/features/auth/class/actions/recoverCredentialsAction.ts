"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { validateEmail } from "../../functions/validateEmail"
import supabaseServer from "@/libs/supabaseServer"
import { getCurrentLocale, getI18n } from "@/locales/server"
import { TLocaleTag } from "@/ts/types/TLocaleTag"

export async function recoverCredentialsAction(email: string) {
  const locale = await getCurrentLocale()
  const t = await getI18n()

  // 1. Validate locale support with compile-time checking
  const localeSupport: Record<TLocaleTag, boolean> = { en: true, lt: true }
  const isLocaleSupported = (loc: string): loc is TLocaleTag => loc in localeSupport && localeSupport[loc as TLocaleTag]
  const validLocale: TLocaleTag = isLocaleSupported(locale) ? locale : "en"

  // 2. Server-side email validation to prevent MITM attacks
  const emailValidation = validateEmail(email, validLocale)
  if (typeof emailValidation === "string") return emailValidation

  // 3. Check if user exists with credentials provider
  const { data: user, error: checkError } = await supabaseAdmin
    .from("users")
    .select("email, providers")
    .eq("email", email)
    .single()
  if (checkError && checkError.code !== "PGRST116") return t("auth.database.error", { message: checkError.message })
  if (!user) return t("auth.database.user_not_found")
  if (!user.providers?.includes("credentials")) return t("auth.database.user_no_credentials_provider")

  // 4. Send password reset email via Supabase Auth
  const { error: resetError } = await supabaseServer().auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (resetError) return t("auth.database.reset_email_failed", { message: resetError.message })

  // 5. Return success message (always success for security - don't reveal if email exists)
  return [t("auth.database.reset_email_sent")]
}
