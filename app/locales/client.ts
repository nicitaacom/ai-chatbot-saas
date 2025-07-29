// locales/client.ts
"use client"
import { createI18nClient } from "next-international/client"

export const { useI18n, useScopedI18n, I18nProviderClient } = createI18nClient({
  en: () => import("./en"),
  lt: () => import("./lt"),
})

export const { useChangeLocale, useCurrentLocale } = createI18nClient({
  en: () => import("./en"),
  lt: () => import("./lt"),
})
