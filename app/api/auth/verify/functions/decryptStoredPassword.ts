import { decryptPassword24 } from "@/features/auth/functions/decryptPassword24"

/**
 * // 4. decryptStoredPassword
 * Decrypt previously encrypted password stored in Redis using your decryptPassword24 util.
 * @param encryptedPassword encrypted blob/string
 * @returns [password] or string error
 */
export async function decryptStoredPassword(encryptedPassword: string): Promise<[string] | string> {
  try {
    const res = await decryptPassword24(encryptedPassword)
    if (typeof res === "string") {
      console.error("decryptStoredPasswordStep decrypt error:", res)
      return "auth.server.error_decrypting_password"
    }
    return res
  } catch (err) {
    console.error("decryptStoredPasswordStep unexpected error:", err)
    return "auth.server.error_decrypting_password"
  }
}
