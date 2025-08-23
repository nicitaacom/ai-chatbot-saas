// emailValidation.ts - Updated with i18n support for client and server
import { TI18nFunction } from "@/ts/types/TI18nHook"
import { TLocaleTag } from "@/ts/types/TLocaleTag"

// Define English messages as const for type inference
const messagesEn = {
  required: "Email is required",
  tooLong: "Email is too long (max 254 characters)",
  invalidFormat: "Email must follow basic email format (e.g. email@example.com)",
  domainMissing: "Domain part must exist (e.g. email@domain.com)",
  emailPartMissing: "Email part must exist (e.g. email@domain.com)",
  emailPartDoubleDot: "Email part should not contain consecutive dots (..)",
  domainPartDoubleDot: "Domain part should not contain consecutive dots (..)",
  domainPartDot: "Domain part must not start or end with a dot (.)",
  emailPartDot: "Email part must not start or end with a dot (.)",
  multipleAt: "Email must contain exactly one @ symbol",
} as const

const messagesLt = {
  required: "E-pasts ir obligāts",
  tooLong: "E-pasts ir pārāk garš (maks. 254 rakstzīmes)",
  invalidFormat: "E-pastam jāatbilst pamata e-pasta formātam (piem. email@example.com)",
  domainMissing: "Domēna daļai jāpastāv (piem. email@domain.com)",
  emailPartMissing: "E-pasta daļai jāpastāv (piem. email@domain.com)",
  emailPartDoubleDot: "E-pasta daļa nedrīkst saturēt secīgus punktus (..)",
  domainPartDoubleDot: "Domēna daļa nedrīkst saturēt secīgus punktus (..)",
  domainPartDot: "Domēna daļa nedrīkst sākties vai beigties ar punktu (.)",
  emailPartDot: "E-pasta daļa nedrīkst sākties vai beigties ar punktu (.)",
  multipleAt: "E-pastam jāsatur tieši viens @ simbols",
} as const

// Type for messages
type EmailMessages = typeof messagesEn | typeof messagesLt

// Translations map - TS will error if a locale is missing or keys are incomplete
const translations: Record<TLocaleTag, EmailMessages> = {
  en: messagesEn,
  lv: messagesLt,
}

// Get messages based on i18n input (t function or locale)
const getEmailValidationMessages = (i18n: TI18nFunction | TLocaleTag) => {
  if (typeof i18n === "function") {
    const t = i18n
    return {
      required: t("auth.email.validation.required"),
      tooLong: t("auth.email.validation.too_long"),
      invalidFormat: t("auth.email.validation.invalid_format"),
      domainMissing: t("auth.email.validation.domain_missing"),
      emailPartMissing: t("auth.email.validation.email_part_missing"),
      emailPartDoubleDot: t("auth.email.validation.email_part_double_dot"),
      domainPartDoubleDot: t("auth.email.validation.domain_part_double_dot"),
      domainPartDot: t("auth.email.validation.domain_part_dot"),
      emailPartDot: t("auth.email.validation.email_part_dot"),
      multipleAt: t("auth.email.validation.multiple_at"),
    }
  } else {
    const locale = i18n
    const msgs = translations[locale] ?? translations.en
    return msgs
  }
}

export const validateEmail = (email: string, i18n: TI18nFunction | TLocaleTag): true | string => {
  const messages = getEmailValidationMessages(i18n)

  // Initial check for empty string or length exceeding 254 characters
  if (!email) return messages.required
  if (email.length > 254) return messages.tooLong

  // Regex for basic email structure
  const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/
  if (!basicEmailRegex.test(email)) {
    return messages.invalidFormat
  }

  const emailParts = email.split("@")

  // Check for exactly one @ symbol
  if (emailParts.length !== 2) return messages.multipleAt

  const emailPart = emailParts[0]
  const domainPart = emailParts[1]

  // Check if parts exist and are not empty
  if (!domainPart || domainPart.trim() === "") return messages.domainMissing
  if (!emailPart || emailPart.trim() === "") return messages.emailPartMissing

  // Check for consecutive dots
  if (emailPart.includes("..")) return messages.emailPartDoubleDot
  if (domainPart.includes("..")) return messages.domainPartDoubleDot

  // Check for dots at start/end
  if (domainPart.startsWith(".") || domainPart.endsWith(".")) return messages.domainPartDot
  if (emailPart.startsWith(".") || emailPart.endsWith(".")) return messages.emailPartDot

  return true // If all checks are passed, it's a valid email
}
