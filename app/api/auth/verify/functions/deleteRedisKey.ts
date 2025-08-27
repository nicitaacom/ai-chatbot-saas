import { redis } from "@/libs/redis"

/**
 * // 7. deleteRedisKey
 * Best-effort deletion of a redis key.
 * @returns [true] or string error
 */
export async function deleteRedisKey(key: string): Promise<[true] | string> {
  try {
    await redis.del(key)
    return [true]
  } catch (err) {
    console.warn("deleteRedisKey failed:", err)
    return `redis.delete_failed::${(err as any)?.message ?? "unknown"}`
  }
}
