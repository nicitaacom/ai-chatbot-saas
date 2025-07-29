import { useI18n } from "@/locales/client"

export function RecoveryForm() {
  const t = useI18n()

  return (
    <form className="space-y-6">
      <div>
        <input
          type="email"
          placeholder={t("auth.email.placeholder")}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand text-white py-3 rounded-xl hover:opacity-90 transition-opacity font-medium">
        {t("auth.recovery.button")}
      </button>

      <div className="text-center">
        <button type="button" className="text-brand hover:underline font-medium">
          {t("auth.sign.in")}
        </button>
      </div>
    </form>
  )
}
