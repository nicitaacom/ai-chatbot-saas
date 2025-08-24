import { useI18n } from "@/locales/client"
import { useLoading } from "@/stores/useLoading"
import Button from "antd/es/button"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import useAuth from "@/features/auth/stores/useAuth"

export function SubmitFormButton() {
  const t = useI18n()
  const { isLoading } = useLoading()
  const { authMode } = useAuth()

  return (
    <Button
      className="!w-full !bg-brand hover:!bg-brand/90 !border-brand
        !rounded-lg !font-medium !h-12 active:scale-[0.98] transition-transform duration-150
        !flex !items-center !justify-center !gap-2"
      type="primary"
      htmlType="submit"
      size="large"
      disabled={isLoading}>
      {isLoading && <LoadingSpinner color="#000000" />}
      <span className="!text-black">
        {t(
          authMode === "login" ? "auth.login.button" : authMode === "recovery" ? "auth.recovery.button" : "auth.register.button",
        )}
      </span>
    </Button>
  )
}
