"use client"

import { ReactNode } from "react"
import { I18nProviderClient } from "@/locales/client"
import { TLocaleTag } from "@/TS/types/TLocale"

export default function SubLayout({ params, children }: { params: { locale: string }; children: ReactNode }) {
  const locale = params.locale as TLocaleTag
  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>
}
