import { useState } from "react"
import { Input, Button } from "antd"

import { useI18n } from "@/locales/client"
import useAuth from "@/stores/useAuth"

export function RecoveryForm() {
  const t = useI18n()
  const { setAuthMode } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // 1. handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <Input
            type="email"
            placeholder={t("auth.email.placeholder")}
            size="large"
            className="!bg-background !border-border-color/30 !text-title placeholder:!text-subTitle
            !rounded-lg hover:!border-brand/60 focus:!border-brand !shadow-none transition-all duration-200"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          loading={isLoading}
          className="!w-full !bg-brand hover:!bg-brand/90 !border-brand [&>span]:!text-black !rounded-lg
          !font-medium !h-12 active:scale-[0.98] transition-transform duration-150">
          {t("auth.recovery.button")}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className="w-full py-2 text-brand hover:text-brand/80 border rounded-lg transition-colors duration-200 font-medium">
          {t("auth.sign.in")}
        </button>
      </div>
    </div>
  )
}
