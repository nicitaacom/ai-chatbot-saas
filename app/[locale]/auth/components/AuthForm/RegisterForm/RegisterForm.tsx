import { useI18n } from "@/locales/client"
import { submitFormWithCredentialsFn } from "@/features/auth/functions/submitFormWithCredentialsFn"
import { SubmitFormButton } from "../components/SubmitFormButton"
import { InputEmail } from "../components/InputEmail"
import { InputPassword } from "../components/InputPassword"

export function RegisterForm() {
  const t = useI18n()

  return (
    <form onSubmit={e => submitFormWithCredentialsFn(e, t)} className="space-y-6">
      {/* Email Input */}
      <InputEmail />

      <InputPassword />

      {/* Submit Button */}
      <SubmitFormButton />
    </form>
  )
}
