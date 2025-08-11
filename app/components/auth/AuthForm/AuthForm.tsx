import { useI18n } from "@/locales/client"
import { TAuthMode } from "@/ts/types/TAuthMode"
import { LoginForm } from "./LoginForm/LoginForm"
import { RegisterForm } from "./RegisterForm/RegisterForm"
import { RecoveryForm } from "./RecoveryForm/RecoveryForm"
import useAuth from "@/stores/useAuth"
import { ContinueWithGoogleButton } from "./ContinueWith/ContinueWithButton"

export function AuthForm() {
  const t = useI18n()
  const { authMode, authError } = useAuth()

  return (
    <div className="space-y-8 w-full max-w-md mx-auto">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-title font-primary leading-tight">{t(`auth.${authMode}.title`)}</h1>
        <p className="text-subTitle font-secondary">{t(`auth.${authMode}.subtitle`)}</p>
        {authError && (
          <div className="bg-danger/40 rounded border border-danger/20">
            <p>{authError}</p>
          </div>
        )}
      </div>
      <FormContent authMode={authMode} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border-color" />
        <span className="pb-0.5">continue with</span>
        <div className="flex-1 h-px bg-border-color" />
      </div>
      {/* Continue button */}
      <ContinueWithGoogleButton />
    </div>
  )
}

export function FormContent({ authMode }: { authMode: TAuthMode }) {
  return authMode === "login" ? <LoginForm /> : authMode === "register" ? <RegisterForm /> : <RecoveryForm />
}
