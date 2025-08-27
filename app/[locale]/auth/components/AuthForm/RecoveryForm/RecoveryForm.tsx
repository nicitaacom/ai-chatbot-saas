import { useI18n } from "@/locales/client"
import { InputEmail } from "../components/InputEmail"
import { SubmitFormButton } from "../components/SubmitFormButton"
import { AuthModeButton } from "../components/AuthModeButton"
import { submitFormWithCredentialsFn } from "@/features/auth/functions/submitFormWithCredentialsFn"
import { useRouter } from "next/navigation"

export function RecoveryForm() {
  const t = useI18n()
  const router = useRouter()

  return (
    <div className="space-y-6">
      <form onSubmit={e => submitFormWithCredentialsFn(e, t, router)} className="space-y-6">
        {/* Email Input */}
        <InputEmail />

        {/* Submit Button */}
        <SubmitFormButton />
      </form>

      {/* Back to Login */}
      <AuthModeButton />
    </div>
  )
}
