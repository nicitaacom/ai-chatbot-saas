import { useI18n } from "@/locales/client"
import { useState } from "react"
import { Input, Button } from "antd"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import useAuth from "@/stores/useAuth"

export function LoginForm() {
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

      {/* Password Input */}
      <div>
        <Input.Password
          placeholder={t("auth.password.placeholder")}
          size="large"
          iconRender={visible =>
            visible ? <AiOutlineEye className="text-subTitle" /> : <AiOutlineEyeInvisible className="text-subTitle" />
          }
          className="!bg-background !border-border-color/30 !text-title
          [&_.ant-input::placeholder]:!text-subTitle !rounded-lg hover:!border-brand/60 focus:!border-brand !shadow-none transition-all duration-200"
        />
      </div>

      {/* Remember & Forgot */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setAuthMode("recovery")}
          className="text-sm text-brand hover:text-brand/80 transition-colors duration-200 font-medium">
          {t("auth.forgot.password")}
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        htmlType="submit"
        size="large"
        loading={isLoading}
        className="!w-full !bg-brand hover:!bg-brand/90 !border-brand [&>span]:!text-black
         !rounded-lg !font-medium !h-12 active:scale-[0.98] transition-transform duration-150">
        {t("auth.login.button")}
      </Button>

      {/* Sign Up Link */}
      <div className="text-center space-x-1">
        <span className="text-subTitle">{t("auth.no.account")}</span>
        <button
          type="button"
          onClick={() => setAuthMode("register")}
          className="text-brand hover:text-brand/80 transition-colors duration-200 font-medium">
          {t("auth.sign.up")}
        </button>
      </div>
    </form>
  )
}
