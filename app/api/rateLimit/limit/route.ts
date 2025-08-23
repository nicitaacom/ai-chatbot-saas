import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

async function rateLimit(
  key: string,
  limit: number,
  window: `${number}${string}`,
): Promise<{ isSuccess: boolean; reset: number; remaining: number } | string> {
  if (typeof window === "undefined") {
    const rateLimit = new Ratelimit({
      redis: Redis.fromEnv(), // it takes UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
      limiter: Ratelimit.slidingWindow(limit, window),
    })

    const { success, reset, remaining } = await rateLimit.limit(key)

    return { isSuccess: success, reset, remaining }
  } else return "This function must be runned on server only"
}

export async function POST(req: Request) {
  const { key, nActions, window, isLimitByIp } = (await req.json()) as API.RateLimitRequest

  if (!key || !nActions || !window) {
    return NextResponse.json(
      {
        message: `Something is missing \n
      key - ${key} \n nActions - ${!nActions} \n perNSeconds - ${window}`,
      },
      { status: 400 },
    )
  }

  /* -------- Rate limit setup ---------- */
  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  const finalKey = isLimitByIp ? `${ip}-${key}` : key
  const rateLimitResp = await rateLimit(finalKey, nActions, window) // 2 requests per 60 seconds
  if (typeof rateLimitResp === "string") {
    return new NextResponse(`Error in rateLimitResp - ${rateLimitResp}`, {
      status: 400,
    })
  }

  const { isSuccess, reset, remaining } = rateLimitResp

  if (!isSuccess) {
    const now = Date.now()
    const retryAfter = Math.floor((reset - now) / 1000)
    return new NextResponse(`Please try again in ${retryAfter} seconds`, {
      status: 429,
      headers: { ["retry-after"]: `${retryAfter}` },
    })
  }
  return NextResponse.json({ remaining, reset } as API.RateLimitResponse, { status: 200 })
}
