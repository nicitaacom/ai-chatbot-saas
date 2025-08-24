// passwordValidation.ts - Enhanced with best security standards (2025 NIST guidelines, zxcvbn, HIBP)

import * as crypto from "crypto"
import zxcvbn from "zxcvbn" // Requires: npm install zxcvbn
import { TI18nFunction } from "@/ts/types/TI18nHook"
import { TLocaleTag } from "@/ts/types/TLocaleTag"

// Keyboard patterns for additional checks (zxcvbn handles many, but explicit for immediate feedback)
const KEYBOARD_PATTERNS = [
  "qwerty",
  "qwertyuiop",
  "asdf",
  "asdfgh",
  "asdfghjkl",
  "zxcv",
  "zxcvbn",
  "zxcvbnm",
  "1234",
  "12345",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "abcd",
  "abcde",
  "abcdef",
  "abcdefg",
  "abcdefgh",
]

// Simple module-level cache for common passwords to avoid repeated server calls
let commonPasswordsCache: Set<string> | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Function to get cached passwords or load them if needed
async function getCommonPasswords(): Promise<Set<string>> {
  const now = Date.now()
  if (commonPasswordsCache && now - cacheTimestamp < CACHE_DURATION) {
    console.log("Using cached common passwords") // debug
    return commonPasswordsCache
  }

  try {
    console.log("Loading common passwords from server...") // debug
    // 2. import correct loader depending on runtime
    const module =
      typeof window === "undefined" ? await import("./loadPasswordsFn") : await import("../class/actions/loadPasswordsAction")

    // 3. call loader (await in case it returns a Promise)
    const mod: any = module

    // 2. call whichever export exists
    const loader = mod.loadPasswordsFn ?? mod.loadPasswordsAction ?? mod.default ?? (() => [])
    const data = await loader()

    // 4. normalise to Set (accept Set or Array)
    const set = data instanceof Set ? data : Array.isArray(data) ? new Set(data) : new Set<string>()
    commonPasswordsCache = set
    cacheTimestamp = now
    return set
  } catch (error) {
    console.error("Failed to load common passwords:", error)
    // 5. ensure cache is a Set so callers can safely call .has
    commonPasswordsCache = new Set<string>()
    cacheTimestamp = now
    return commonPasswordsCache
  }
}

// Optional: Function to manually clear cache (useful for testing or updates)
export function clearPasswordCache(): void {
  commonPasswordsCache = null
  cacheTimestamp = 0
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: "weak" | "fair" | "good" | "strong"
  score: number // 0-100
}

// Define English messages as const for type inference
const messagesEn = {
  required: "Password is required",
  minLength: "Password must be at least 15 characters long",
  maxLength: "Password must not exceed 128 characters (DoS protection)",
  prohibitedChars: "Password contains prohibited control characters",
  nullBytes: "Password contains null bytes which are not allowed",
  commonPassword: "This password is in the list of commonly used passwords and is easily guessable",
  breachedPassword: "This password has appeared in a data breach and is not safe to use",
  keyboardPatterns: "Password contains keyboard patterns which are easily guessable",
  repeatingChars: "Password contains too many repeating characters",
  sequentialChars: "Password contains sequential characters which are easily guessable",
  leetSpeak: "Password is a common password with simple character substitutions",
  personalInfo: "Password contains personal information and is easily guessable",
  tooWeak: "Password is too weak. Please choose a stronger password.",
  tooFair: "Password is too fair. Please choose a stronger password.",
} as const

const messagesLt = {
  required: "Parole ir obligāta",
  minLength: "Parolei jābūt vismaz 15 rakstzīmju garai",
  maxLength: "Parole nedrīkst pārsniegt 128 rakstzīmes (DoS aizsardzība)",
  prohibitedChars: "Parole satur aizliegtas kontroles rakstzīmes",
  nullBytes: "Parole satur null baitus, kas nav atļauti",
  commonPassword: "Šī parole ir bieži izmantoto paroļu sarakstā un ir viegli uzminēma",
  breachedPassword: "Šī parole ir parādījusies datu pārkāpumā un nav droša lietošanai",
  keyboardPatterns: "Parole satur tastatūras modeļus, kas ir viegli uzminēmi",
  repeatingChars: "Parole satur pārāk daudz atkārtojošos rakstzīmju",
  sequentialChars: "Parole satur secīgas rakstzīmes, kas ir viegli uzminēmas",
  leetSpeak: "Parole ir bieži izmantota parole ar vienkāršām rakstzīmju aizstāšanām",
  personalInfo: "Parole satur personisku informāciju un ir viegli uzminēma",
  tooWeak: "Parole ir pārāk vāja. Lūdzu, izvēlieties stiprāku paroli.",
  tooFair: "Parole ir pārāk vidēja. Lūdzu, izvēlieties stiprāku paroli.",
} as const

// Type for messages
type PasswordMessages = typeof messagesEn | typeof messagesLt

// Translations map - TS will error if a locale is missing or keys are incomplete
const translations: Record<TLocaleTag, PasswordMessages> = {
  en: messagesEn,
  lv: messagesLt,
}

// Get messages based on i18n input (t function or locale)
const getValidationMessages = (i18n: TI18nFunction | TLocaleTag) => {
  if (typeof i18n === "function") {
    const t = i18n
    return {
      required: t("auth.password.validation.required"),
      minLength: t("auth.password.validation.min_length"),
      maxLength: t("auth.password.validation.max_length"),
      prohibitedChars: t("auth.password.validation.prohibited_chars"),
      nullBytes: t("auth.password.validation.null_bytes"),
      commonPassword: t("auth.password.validation.common_password"),
      breachedPassword: t("auth.password.validation.breached_password"),
      keyboardPatterns: t("auth.password.validation.keyboard_patterns"),
      repeatingChars: t("auth.password.validation.repeating_chars"),
      sequentialChars: t("auth.password.validation.sequential_chars"),
      leetSpeak: t("auth.password.validation.leet_speak"),
      personalInfo: t("auth.password.validation.personal_info"),
      tooWeak: t("auth.password.validation.too_weak"),
      tooFair: t("auth.password.validation.too_fair"),
    }
  } else {
    const locale = i18n
    const msgs = translations[locale] ?? translations.en
    return msgs
  }
}

// Async function to check if password is breached using HIBP API (k-anonymity)
async function isPasswordBreached(password: string): Promise<boolean> {
  try {
    const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase()
    const prefix = hash.slice(0, 5)
    const suffix = hash.slice(5)

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "User-Agent": "ai-chatbot-saas" },
    })

    if (!response.ok) {
      console.error("HIBP API error:", response.status)
      return false // Fallback to not breached if API fails
    }

    const text = await response.text()
    const lines = text.split("\r\n") // HIBP uses \r\n

    for (const line of lines) {
      const [hashSuffix, count] = line.split(":")
      if (hashSuffix === suffix && parseInt(count, 10) > 0) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error checking HIBP:", error)
    return false // Fallback on error
  }
}

/**
 *
 * @param password
 * @param userInputs e.g email
 * @param i18n if function runned on server then pass getCurrentLocale() otherwise - pass function
 * @returns
 *
 */
export const validatePassword = async (
  password: string,
  userInputs: string[] = [],
  i18n: TI18nFunction | TLocaleTag,
): Promise<true | string> => {
  const result = await validatePasswordDetailed(password, userInputs, i18n)

  if (!result.isValid) {
    return result.errors[0] // Return first error for simple validation
  }

  if (result.strength === "weak" || result.strength === "fair") {
    const messages = getValidationMessages(i18n)
    return result.strength === "weak" ? messages.tooWeak : messages.tooFair
  }

  return true
}

export const validatePasswordDetailed = async (
  password: string,
  userInputs: string[] = [], // e.g., [username, email.split('@')[0], firstName, etc.]
  i18n: TI18nFunction | TLocaleTag,
): Promise<PasswordValidationResult> => {
  const messages = getValidationMessages(i18n)
  const errors: string[] = []

  // Basic validation
  if (!password) {
    return {
      isValid: false,
      errors: [messages.required],
      strength: "weak",
      score: 0,
    }
  }

  // Trim any leading/trailing spaces (usability)
  password = password.trim()

  // Length requirements (2025 NIST: min 8, recommend 15+ for security)
  if (password.length < 15) {
    errors.push(messages.minLength)
  }

  // Maximum length to prevent DoS attacks
  if (password.length > 128) {
    errors.push(messages.maxLength)
  }

  // No composition rules per NIST (no required char types), rely on strength estimator

  // Check for prohibited characters that could cause injection or encoding issues
  const prohibitedChars = /[\x00-\x1F\x7F-\x9F]/ // Control characters
  if (prohibitedChars.test(password)) {
    errors.push(messages.prohibitedChars)
  }

  // Protection against null bytes and other injection attempts
  if (password.includes("\0") || password.includes("\x00")) {
    errors.push(messages.nullBytes)
  }

  // Check against common passwords using cached data
  let commonPasswords = await getCommonPasswords()
  const lowercasePassword = password.toLowerCase()
  if (!commonPasswords || typeof commonPasswords.has !== "function") commonPasswords = new Set<string>()
  if (commonPasswords.has(lowercasePassword)) errors.push(messages.commonPassword)

  if (commonPasswords.has(lowercasePassword)) {
    errors.push(messages.commonPassword)
  }

  // Check if password appears in data breaches (HIBP)
  const isBreached = await isPasswordBreached(password)
  if (isBreached) {
    errors.push(messages.breachedPassword)
  }

  // Check for keyboard patterns
  for (const pattern of KEYBOARD_PATTERNS) {
    if (lowercasePassword.includes(pattern) || lowercasePassword.includes(pattern.split("").reverse().join(""))) {
      errors.push(messages.keyboardPatterns)
      break
    }
  }

  // Check for repetitive patterns
  const hasRepeatingChars = /(.)\1{3,}/.test(password) // 4 or more same chars in a row
  if (hasRepeatingChars) {
    errors.push(messages.repeatingChars)
  }

  // Check for simple incrementing patterns
  const hasIncrementingPattern =
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password,
    )
  if (hasIncrementingPattern) {
    errors.push(messages.sequentialChars)
  }

  // Check for common substitutions (l33t speak)
  const commonSubstitutions = password
    .replace(/[4@]/g, "a")
    .replace(/3/g, "e")
    .replace(/1!/g, "i")
    .replace(/0/g, "o")
    .replace(/5$/g, "s")
    .replace(/7/g, "t")
    .toLowerCase()

  if (commonPasswords.has(commonSubstitutions)) {
    errors.push(messages.leetSpeak)
  }

  // Check for personal information (e.g., username, email parts)
  const lowerUserInputs = userInputs.map(input => (input || "").toLowerCase().trim()).filter(input => input.length > 0)
  for (const input of lowerUserInputs) {
    if (lowercasePassword.includes(input)) {
      errors.push(messages.personalInfo)
      break
    }
  }

  // Use zxcvbn for advanced strength estimation (handles entropy, patterns, dictionary, l33t, etc.)
  const zxcvbnResult = zxcvbn(password, userInputs)
  const zxcvbnScore = zxcvbnResult.score // 0-4
  const score = zxcvbnScore * 25 // Map to 0-100

  // Determine strength based on zxcvbn score
  let strength: "weak" | "fair" | "good" | "strong"
  switch (zxcvbnScore) {
    case 0:
    case 1:
      strength = "weak"
      break
    case 2:
      strength = "fair"
      break
    case 3:
      strength = "good"
      break
    case 4:
      strength = "strong"
      break
    default:
      strength = "weak"
  }

  // If zxcvbn detects issues, add to errors if not already covered
  if (zxcvbnScore < 3 && errors.length === 0) {
    errors.push(messages.tooWeak) // Fallback error if weak but no specific error
  }

  const isValid = errors.length === 0 && zxcvbnScore >= 3 // Require at least "good" for validity, but configurable

  return {
    isValid,
    errors,
    strength,
    score: Math.max(0, Math.min(100, score)),
  }
}
