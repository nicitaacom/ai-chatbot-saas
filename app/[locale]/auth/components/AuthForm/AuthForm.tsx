import { TAuthMode } from "@/features/auth/types/TAuthMode"
import useAuth from "@/features/auth/stores/useAuth"
import { LoginForm } from "./LoginForm/LoginForm"
import { RegisterForm } from "./RegisterForm/RegisterForm"
import { RecoveryForm } from "./RecoveryForm/RecoveryForm"
import { ContinueWithGoogleButton } from "./ContinueWith/ContinueWithButton"
import { AuthHeader } from "../AuthHeader"

export function AuthForm() {
  const { authMode } = useAuth()

  return (
    <div className="space-y-8 w-full max-w-md mx-auto">
      <AuthHeader />
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
