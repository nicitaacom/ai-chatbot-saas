import { TEmailVerificationResponse } from "../types/TEmailVerificationResponse"

export const getConfidenceScore = (response: TEmailVerificationResponse): number => {
  // 1. Fast-fail invalids
  if (
    response.status === "invalid" ||
    response.mx_found === false ||
    response.mx_found === "false" ||
    response.mx_record === response.domain
  )
    return 0

  // 2. Hard rejection based on dangerous statuses
  const criticalSubStatuses = ["mailbox_not_found", "disposable", "does_not_accept_mail", "spamtrap"]
  if (response.status === "do_not_mail" && criticalSubStatuses.includes(response.sub_status)) return 0

  // 3. Init score
  let score = 0

  // 4. MX record found? +40
  if (response.mx_found === true || response.mx_found === "true") score += 40

  // 5. SMTP provider found? +30 (+10 if trusted)
  if (response.smtp_provider?.trim()) {
    score += 30
    const trusted = ["microsoft", "google", "amazonses", "godaddy"]
    if (trusted.some(p => response.smtp_provider.toLowerCase().includes(p))) score += 10
  }

  // 6. Domain age bonus if > 2 years +20
  const domainAge = Number(response.domain_age_days) || 0
  if (domainAge > 365 * 2) score += 20

  // 7. Account check — if personal-like, +10
  const personalPattern = /^(firstname\.lastname|name|contact|enquiry)/i
  if (!["info", "support", "sales", "admin"].includes(response.account.toLowerCase()) || personalPattern.test(response.address))
    score += 10

  // 8. Status downgrades
  const catchAllSubstatuses = ["accept_all", "role_based_catch_all"]
  const isCatchAll = response.status === "do_not_mail" && catchAllSubstatuses.includes(response.sub_status)
  if (isCatchAll) score = Math.floor(score * 0.8) // downgrade by 20%

  if (response.status === "do_not_mail") score = Math.max(score - 20, 0) // general penalty

  // 9. Cap at 100
  return Math.min(score, 100)
}
