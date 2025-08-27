import jwt from "jsonwebtoken"
import { setCookie } from "@/utils/helpersSSR"
/**
 * // 8. signAndSetAuthCookie
 * Sign app-level JWT and set it via your setCookie helper.
 * @param constructedUser object with user & session
 * @returns [token] or string error
 */
export async function signAndSetAuthCookie(constructedUser: { user: any; session: any }): Promise<[string] | string> {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return "auth.server.missing_jwt_secret"
  try {
    const token = jwt.sign(constructedUser, jwtSecret, { expiresIn: "1h" })
    setCookie("auth_token", token) // TODO - check if it actually set cookie on register
    return [token]
  } catch (err) {
    console.error("signAndSetAuthCookie error:", err)
    return `auth.server.sign_failed::${(err as any)?.message ?? "jwt_sign_failed"}`
  }
}
