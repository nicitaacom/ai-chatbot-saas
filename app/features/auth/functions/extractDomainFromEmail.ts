// DEPENDS ON: VM-receiveEmails
export function extractDomainFromEmail(email: string, includeSubDomain: "with-subdomain" | "without-subdomain") {
  const emailMatch = email.match(/<(.*?)>/) // 📩 if email is inside <>, extract inside part
  const extractedEmail = emailMatch ? emailMatch[1] : email.replace(/"/g, "") // 📨 otherwise just strip quotes
  const domain = extractedEmail.split("@")[1] // 🌐 take everything after @ → e.g. "mail.ns-roofing.co.uk"

  if (includeSubDomain === "with-subdomain") return domain
  // 🎯 returns the full domain exactly as after @
  // e.g. "mail.ns-roofing.co.uk"

  // 🏷️ for "without-subdomain", drop only the *first* part if more than 2
  const parts = domain.split(".") // e.g. ["mail","ns-roofing","co","uk"]
  return parts.length > 2
    ? parts.slice(1).join(".") // → "ns-roofing.co.uk"
    : domain // if already just "example.com" → stays "example.com"
}
