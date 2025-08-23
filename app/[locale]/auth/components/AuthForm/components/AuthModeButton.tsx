"use client"

import useAuth from "@/features/auth/stores/useAuth"
import { useI18n } from "@/locales/client"

export function AuthModeButton() {
  const t = useI18n()
  const { authMode, setAuthMode } = useAuth()

  return (
    <div className="text-center space-x-1">
      <span className="text-subTitle">{t("auth.no.account")}</span>
      <button
        className="text-brand hover:text-brand/80 transition-colors duration-200 font-medium"
        type="button"
        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>
        {t("auth.sign.up")}
      </button>
    </div>
  )
}
