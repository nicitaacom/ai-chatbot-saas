import { redis } from "@/libs/redis"

/**
 * // 3. fetchVerifyRecord
 * Read `verify:{id}` from Redis and parse JSON { email, encryptedPassword }.
 * @param id redis id
 * @returns [{ email, encryptedPassword }] or string error
 */
export async function fetchVerifyRecord(id: string): Promise<[{ email: string; encryptedPassword: string }] | string> {
  const key = `verify:${id}`
  try {
    const raw = (await redis.get(key)) as string | null
    if (!raw) return "auth.verify.invalid_or_expired_token"
    const parsed = JSON.parse(raw) as { email?: string; encryptedPassword?: string }
    if (!parsed?.email || !parsed?.encryptedPassword) {
      await redis.del(key).catch(() => void 0)
      return "auth.server.invalid_data"
    }
    return [{ email: parsed.email, encryptedPassword: parsed.encryptedPassword }]
  } catch (err) {
    console.error("fetchVerifyRecord error:", err)
    return "auth.server.invalid_data"
  }
}
