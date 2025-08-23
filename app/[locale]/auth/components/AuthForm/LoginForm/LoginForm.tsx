import { submitFormWithCredentialsFn } from "@/features/auth/functions/submitFormWithCredentialsFn"
import { SubmitFormButton } from "../components/SubmitFormButton"
import { ForgotPassword } from "./ForgotPassword"
import { AuthModeButton } from "../components/AuthModeButton"
import { InputPassword } from "../components/InputPassword"
import { InputEmail } from "../components/InputEmail"
import { useI18n } from "@/locales/client"

export function LoginForm() {
  const t = useI18n()

  return (
    <form onSubmit={e => submitFormWithCredentialsFn(e, t)} className="space-y-6">
      {/* Email Input */}
      <InputEmail />

      {/* Password Input */}
      <InputPassword />

      {/* Remember & Forgot */}
      <ForgotPassword />

      {/* Submit Button */}
      <SubmitFormButton />

      {/* Sign Up Link */}
      <AuthModeButton />
    </form>
  )
}
