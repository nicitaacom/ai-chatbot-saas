import * as fs from "fs"
import * as path from "path"

export function loadPasswordsFn() {
  let commonPasswordsCache: Set<string> | null = null

  if (commonPasswordsCache) return commonPasswordsCache

  try {
    const filePath = path.join(process.cwd(), "app", "features", "auth", "consts", "xato-net-10-million-passwords-1000000.txt")

    const fileContent = fs.readFileSync(filePath, "utf-8")
    commonPasswordsCache = new Set(
      fileContent
        .split("\n")
        .map(pwd => pwd.trim().toLowerCase())
        .filter(pwd => pwd.length > 0),
    )

    console.log(`Loaded ${commonPasswordsCache.size} common passwords from file`)
    return commonPasswordsCache
  } catch (error) {
    console.error(31, "Failed to load common passwords file:", error)
    // Fallback to a small set of most common passwords if file reading fails
    commonPasswordsCache = new Set([
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "password1",
      "qwertyuiop",
      "123123",
      "000000",
      "iloveyou",
      "1q2w3e4r",
      "master",
      "dragon",
    ])
    return commonPasswordsCache
  }
}
