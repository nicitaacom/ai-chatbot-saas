import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// function formatTimeLeft(resetEpochSeconds: number) {
//   const now = Math.floor(Date.now() / 1000)
//   const secondsLeft = Math.max(resetEpochSeconds - now, 0)
//   const days = Math.floor(secondsLeft / 86400)
//   const hours = Math.floor((secondsLeft % 86400) / 3600)
//   return `${days}d ${hours}h`
// }

async function getRemaning(key: string): Promise<{ reset: number; remaining: number } | string> {
  if (typeof window === "undefined") {
    const rateLimit = new Ratelimit({
      redis: Redis.fromEnv(), // it takes UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
      limiter: Ratelimit.slidingWindow(1, `1 s`),
    })

    const { reset, remaining } = await rateLimit.getRemaining(key)

    return { remaining, reset }
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
  const rateLimitResp = await getRemaning(finalKey)
  if (typeof rateLimitResp === "string") {
    return new NextResponse(`Error getting remaining: ${rateLimitResp}`, {
      status: 400,
    })
  }
  return NextResponse.json({ reset: rateLimitResp.reset, remaining: rateLimitResp.remaining } as API.RateLimitResponse, {
    status: 200,
  })
}
