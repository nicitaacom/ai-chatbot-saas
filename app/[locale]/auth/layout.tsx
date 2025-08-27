import { I18nProviderClient } from "@/locales/client"
import { TLocaleTag } from "@/ts/types/TLocaleTag"
import AuthPage from "./page"

export default function SubLayout({ params }: { params: { locale: string } }) {
  const locale = params.locale as TLocaleTag
  return (
    <I18nProviderClient locale={locale}>
      <AuthPage />
    </I18nProviderClient>
  )
}
