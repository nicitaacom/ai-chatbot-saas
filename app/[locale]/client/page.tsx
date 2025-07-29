"use client"

import { useI18n, useScopedI18n } from "../../locales/client"
import { useChangeLocale, useCurrentLocale } from "../../locales/client"

export default function ClientPage() {
  const t = useI18n()
  const scopedT = useScopedI18n("hello")
  const changeLocale = useChangeLocale()
  const locale = useCurrentLocale()
  return (
    <div>
      <p>{t("hello")}</p>

      {/* Both are equivalent: */}
      <p>{t("hello.world")}</p>
      <p>{scopedT("world")}</p>

      <p>{t("welcome", { name: "John" })}</p>
      <p>{t("welcome", { name: <strong>John</strong> })}</p>
      <>
        <p>Current locale: {locale}</p>
        <button onClick={() => changeLocale("en")}>English</button>
        <button onClick={() => changeLocale("lt")}>Latvian</button>
      </>
    </div>
  )
}
