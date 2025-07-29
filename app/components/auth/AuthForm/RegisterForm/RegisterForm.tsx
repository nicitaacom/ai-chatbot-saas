import { useI18n } from "@/locales/client"

export function RegisterForm() {
  const t = useI18n()

  return (
    <form className="space-y-6">
      <div>
        <input
          type="text"
          placeholder={t("auth.username.placeholder")}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      <div>
        <input
          type="email"
          placeholder={t("auth.email.placeholder")}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      <div>
        <input
          type="password"
          placeholder={t("auth.password.placeholder")}
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-brand text-white py-3 rounded-xl hover:opacity-90 transition-opacity font-medium">
        {t("auth.register.button")}
      </button>

      <div className="text-center">
        <span>{t("auth.have.account")} </span>
        <button type="button" className="text-brand hover:underline font-medium">
          {t("auth.sign.in")}
        </button>
      </div>
    </form>
  )
}
