/**
 * MAKE SURE EXECUTE THIS FUNCTION IN SERVER ACTIONS OR IN API ROUTES
 * @param encryptedPassword
 * @returns ["decrypted password"] or "error message"
 */
export async function decryptPassword24(encryptedPassword: string): Promise<[string] | string> {
  if (typeof window !== "undefined") return "This function can be run on server only"

  try {
    if (!encryptedPassword || encryptedPassword.length < 15) return "Invalid encrypted password: length < 15"

    const secret = process.env.PASSWORD_SECRET
    if (!secret) return "Missing PASSWORD_SECRET environment variable"

    const combined = Buffer.from(encryptedPassword, "base64")
    const salt = combined.subarray(0, 16) // 1. Extract salt
    const iv = combined.subarray(16, 28) // 2. Extract IV
    const encryptedData = combined.subarray(28) // 3. Extract encrypted data

    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      // 4. Import secret as key material
      "raw",
      encoder.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    )

    const derivedKey = await crypto.subtle.deriveKey(
      // 5. Derive key using PBKDF2
      {
        name: "PBKDF2",
        salt,
        iterations: 60510,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    )

    const decrypted = await crypto.subtle.decrypt(
      // 6. Decrypt using AES-GCM
      { name: "AES-GCM", iv },
      derivedKey,
      encryptedData,
    )

    return [new TextDecoder().decode(decrypted)] // 7. Return decrypted password in array
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown decryption error"
    return `Decryption failed: ${errorMessage}`
  }
}
