"use client"

import useAuth from "@/features/auth/stores/useAuth"
import { useI18n } from "@/locales/client"

export function ForgotPassword() {
  const t = useI18n()
  const { setAuthMode } = useAuth()
  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={() => setAuthMode("recovery")}
        className="text-sm text-brand hover:text-brand/80 transition-colors duration-200 font-medium">
        {t("auth.forgot.password")}
      </button>
    </div>
  )
}
