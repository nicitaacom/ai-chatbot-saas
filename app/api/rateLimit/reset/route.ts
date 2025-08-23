import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

async function reset(key: string): Promise<void | string> {
  if (typeof window === "undefined") {
    const rateLimit = new Ratelimit({
      redis: Redis.fromEnv(), // it takes UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
      limiter: Ratelimit.slidingWindow(1, `1 s`),
    })

    await rateLimit.resetUsedTokens(key)
  } else return "This function must be runned on server only"
}

export async function POST(req: Request) {
  const { key, isLimitByIp } = (await req.json()) as API.RateLimitRequest

  if (!key) {
    return NextResponse.json({ message: `Something is missing \n key - ${key} \n` }, { status: 400 })
  }

  /* -------- Rate limit setup ---------- */
  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  const finalKey = isLimitByIp ? `${ip}-${key}` : key
  const rateLimitResp = await reset(finalKey)
  if (typeof rateLimitResp === "string") {
    return new NextResponse(`Error reseting: ${rateLimitResp}`, {
      status: 400,
    })
  }

  return NextResponse.json({}, { status: 200 })
}
