/**
 * MAKE SURE EXECUTE THIS FUNCTION IN SERVER ACTIONS OR IN API ROUTES
 * @param encryptedPassword
 * @returns ["decrypted password"] or "error message"
 */
export async function encryptPassword24(password: string): Promise<[string] | string> {
  if (typeof window !== "undefined") return "This function can be run on server only"

  try {
    if (!password || password.length < 15) return "Invalid password: cannot be empty or it's length must be more 15 or more"

    const secret = process.env.PASSWORD_SECRET
    if (!secret) return "Missing PASSWORD_SECRET environment variable"

    const encoder = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16)) // 1. Generate random salt
    const iv = crypto.getRandomValues(new Uint8Array(12)) // 2. Generate random IV

    const keyMaterial = await crypto.subtle.importKey(
      // 3. Import secret as key material
      "raw",
      encoder.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    )

    const derivedKey = await crypto.subtle.deriveKey(
      // 4. Derive key using PBKDF2
      {
        name: "PBKDF2",
        salt,
        iterations: 60510,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"],
    )

    const encrypted = await crypto.subtle.encrypt(
      // 5. Encrypt using AES-GCM
      { name: "AES-GCM", iv },
      derivedKey,
      encoder.encode(password),
    )

    // 6. Combine salt, IV, and encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)

    // 7. Return as base64 string in array
    return [Buffer.from(combined).toString("base64")]
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown encryption error"
    return `Encryption failed: ${errorMessage}`
  }
}
