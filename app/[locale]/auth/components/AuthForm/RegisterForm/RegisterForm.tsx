import { useI18n } from "@/locales/client"
import { submitFormWithCredentialsFn } from "@/features/auth/functions/submitFormWithCredentialsFn"
import { SubmitFormButton } from "../components/SubmitFormButton"
import { InputEmail } from "../components/InputEmail"
import { InputPassword } from "../components/InputPassword"
import { AuthModeButton } from "../components/AuthModeButton"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const t = useI18n()
  const router = useRouter()

  return (
    <form onSubmit={e => submitFormWithCredentialsFn(e, t, router)} className="space-y-6">
      {/* Email Input */}
      <InputEmail />

      <InputPassword />

      {/* Submit Button */}
      <SubmitFormButton />

      {/* Sign Up Link */}
      <AuthModeButton />
    </form>
  )
}
