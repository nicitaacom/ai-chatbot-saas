"use server"

import ZeroBounceSDK from "@zerobounce/zero-bounce-sdk"
import { getConfidenceScore } from "../../functions/getConfidenceScore"
import { TEmailVerificationResponse } from "../../types/TEmailVerificationResponse"
import { extractDomainFromEmail } from "../../functions/extractDomainFromEmail"
import { getI18n } from "@/locales/server"
import { TLocaleTag } from "@/ts/types/TLocaleTag"

export async function verifyEmailsAction(emailsToVerify: string[]) {
  const t = await getI18n()

  // Validate that the locale is supported, fallback to 'en' if not (needed for TS when added new language)
  const localeSupport: Record<TLocaleTag, boolean> = { en: true, lt: true }

  const blockedDomains = ["outreach-tool", "ai-chatbot"]
  const zeroBounce = new ZeroBounceSDK()

  zeroBounce.init(process.env.ZEROBOUNCE_API_KEY)

  // Helper function to check if an email domain is blocked
  const isBlockedDomain = (email: string): boolean => {
    const domain = extractDomainFromEmail(email, "without-subdomain")
    return blockedDomains.includes(domain)
  }

  let invalidEmails: string[] = []
  for (const email of emailsToVerify) {
    if (isBlockedDomain(email)) {
      t("auth.email_not_allowed_with_this_domain")
      return `You're not allowed to enter emails with the domains: ${blockedDomains}`
    }

    // Validate the email using ZeroBounce
    const response: TEmailVerificationResponse = await zeroBounce.validateEmail(email)
    if (getConfidenceScore(response) === 0) {
      invalidEmails.push(email)
    }
  }

  return invalidEmails
}
