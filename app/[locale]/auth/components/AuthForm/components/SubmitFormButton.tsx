import { useI18n } from "@/locales/client"
import { useLoading } from "@/stores/useLoading"
import Button from "antd/es/button"

export function SubmitFormButton() {
  const t = useI18n()
  const { isLoading } = useLoading()

  return (
    <Button
      className="!w-full !bg-brand hover:!bg-brand/90 !border-brand [&>span]:!text-black
   !rounded-lg !font-medium !h-12 active:scale-[0.98] transition-transform duration-150"
      type="primary"
      htmlType="submit"
      size="large"
      loading={isLoading}>
      {t("auth.login.button")}
    </Button>
  )
}
