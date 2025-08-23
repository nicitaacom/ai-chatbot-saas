// locales/server.ts
import { createI18nServer } from "next-international/server"

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
  en: () => import("./en"),
  lv: () => import("./lv"),
})

export const { getCurrentLocale } = createI18nServer({
  en: () => import("./en"),
  lv: () => import("./lv"),
})
