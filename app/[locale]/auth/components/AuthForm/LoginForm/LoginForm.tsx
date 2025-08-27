import { submitFormWithCredentialsFn } from "@/features/auth/functions/submitFormWithCredentialsFn"
import { SubmitFormButton } from "../components/SubmitFormButton"
import { AuthFooter } from "./AuthFooter"
import { AuthModeButton } from "../components/AuthModeButton"
import { InputPassword } from "../components/InputPassword"
import { InputEmail } from "../components/InputEmail"
import { useI18n } from "@/locales/client"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const t = useI18n()
  const router = useRouter()

  return (
    <form onSubmit={e => submitFormWithCredentialsFn(e, t, router)} className="space-y-6">
      {/* Email Input */}
      <InputEmail />

      <div className="space-y-3">
        {/* Password Input */}
        <InputPassword />

        {/* Remember & Forgot */}
        <AuthFooter />
      </div>

      {/* Submit Button */}
      <SubmitFormButton />

      {/* Sign Up Link */}
      <AuthModeButton />
    </form>
  )
}
