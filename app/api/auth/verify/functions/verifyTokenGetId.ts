import jwt, { JwtPayload } from "jsonwebtoken"

/**
 * // 2. verifyTokenGetId
 * Verify JWT token and return redis id (payload.id) that points to stored verification data.
 * @param token signed jwt token
 * @param jwtSecret secret used to sign token
 * @returns [id] on success OR string error key
 */
export async function verifyTokenGetId(token: string, jwtSecret: string): Promise<[string] | string> {
  try {
    const decoded = jwt.verify(token, jwtSecret)
    if (typeof decoded === "string") return "auth.verify.invalid_token_payload"
    const payload = decoded as JwtPayload & { id?: string; type?: string }
    if (payload?.type !== "email_verification" || typeof payload?.id !== "string") return "auth.verify.invalid_token_payload"
    return [payload.id]
  } catch (err) {
    console.warn("verifyTokenGetId:", err)
    return "auth.verify.invalid_or_expired_token"
  }
}
