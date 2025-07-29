import { useI18n } from "@/locales/client"
import { TAuthMode } from "@/TS/types/TAuthMode"
import { LoginForm } from "./LoginForm/LoginForm"
import { RegisterForm } from "./RegisterForm/RegisterForm"
import { RecoveryForm } from "./RecoveryForm/RecoveryForm"
import useAuth from "@/stores/useAuth"

export function AuthForm() {
  const t = useI18n()

  const { authMode } = useAuth()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-title mb-2 whitespace-pre-line">{t(`auth.${authMode}.title`)}</h1>
        <p className="text-subTitle">{t(`auth.${authMode}.subtitle`)}</p>
      </div>
      <FormContent authMode={authMode} />
    </div>
  )
}

export function FormContent({ authMode }: { authMode: TAuthMode }) {
  if (authMode === "login") return <LoginForm />
  if (authMode === "register") return <RegisterForm />
  return <RecoveryForm />
}
