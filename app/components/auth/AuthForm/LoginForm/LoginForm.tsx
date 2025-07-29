import { useI18n } from "@/locales/client"

export function LoginForm() {
  const t = useI18n()

  return (
    <form className="space-y-6">
      <div>
        <input
          type="email"
          placeholder={t("auth.email.placeholder")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      <div>
        <input
          type="password"
          placeholder={t("auth.password.placeholder")}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="w-4 h-4 text-brand border-gray-300 rounded focus:ring-brand" />
          <span className="ml-2 text-sm text-gray-600">{t("auth.remember.me")}</span>
        </label>
        <button type="button" className="text-sm text-brand hover:underline">
          {t("auth.forgot.password")}
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-brand text-white py-3 rounded-xl hover:opacity-90 transition-opacity font-medium">
        {t("auth.login.button")}
      </button>

      <div className="text-center">
        <span className="text-gray-600">{t("auth.no.account")} </span>
        <button type="button" className="text-brand hover:underline font-medium">
          {t("auth.sign.up")}
        </button>
      </div>
    </form>
  )
}
