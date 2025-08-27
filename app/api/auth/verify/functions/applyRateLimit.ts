import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Window =
  | `${number}s`
  | `${number} s`
  | `${number}m`
  | `${number} m`
  | `${number}h`
  | `${number} h`
  | `${number}d`
  | `${number} d`
type RLResp = { ok: boolean; reset?: number; remaining?: number; reason?: string }

const RATE_LIMIT_KEY = "email:verify"
const RATE_LIMIT = 10
// properly typed duration for Upstash Ratelimit
const RATE_LIMIT_WINDOW: Window = "1d" // e.g. "1d", "60s", "1h"

const redis = Redis.fromEnv() // used by limiter

export async function applyRateLimit(
  ip: string,
  key = RATE_LIMIT_KEY,
  limit = RATE_LIMIT,
  window = RATE_LIMIT_WINDOW,
): Promise<RLResp> {
  try {
    const limiter = new Ratelimit({ redis: redis, limiter: Ratelimit.slidingWindow(limit, window) })
    const { success, reset, remaining } = await limiter.limit(`${ip}-${key}`)
    return { ok: success, reset, remaining }
  } catch (err) {
    console.error("applyRateLimitStep error:", err)
    return { ok: false, reason: "ratelimit-failed" }
  }
}
