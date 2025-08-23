// app/api/auth/verify/route.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import jwt, { JwtPayload } from "jsonwebtoken"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { getI18n } from "@/locales/server"
import type { NextRequest } from "next/server"

// --------------- types ----------------
type VerifyTokenPayload = JwtPayload & { type?: string; sub?: string; email?: string }
type RateLimitResp = { ok: boolean; reset?: number; remaining?: number; reason?: string }

// --------------- rate limiter (server only) ----------------
async function applyRateLimit(ip: string, key = "email:verify", limit = 10, window = "1d"): Promise<RateLimitResp> {
  if (typeof window !== "undefined") return { ok: false, reason: "server-only" }
  try {
    const limiter = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(limit, window) })
    const { success, reset, remaining } = await limiter.limit(`${ip}-${key}`)
    return { ok: success, reset, remaining }
  } catch (err) {
    console.error("ratelimit error:", err)
    return { ok: false, reason: "ratelimit-failed" }
  }
}

// --------------- GET /api/auth/verify?token=... ----------------
export async function GET(req: NextRequest) {
  const t = await getI18n() // i18n for messages
  // 0. env sanity
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return NextResponse.json({ message: t("auth.server.missing_jwt_secret") }, { status: 500 })

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")
  const acceptHeader = headers().get("accept") ?? ""

  // 1. parse token & client ip
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  // 2. early rate limit (counts even if token missing/invalid)
  const rl = await applyRateLimit(ip)
  if (!rl.ok) {
    const now = Date.now()
    const retryAfter = rl.reset ? Math.max(0, Math.floor((rl.reset - now) / 1000)) : 60
    return new NextResponse(`Please try again in ${retryAfter} seconds`, {
      status: 429,
      headers: { "retry-after": `${retryAfter}` },
    })
  }

  // 3. missing token
  if (!token) {
    const body = { message: t("auth.verify.missing_token") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=missing_token`)
      : NextResponse.json(body, { status: 400 })
  }

  // 4. verify token (type-safe)
  let decoded: string | JwtPayload
  try {
    decoded = jwt.verify(token, jwtSecret)
  } catch (verifyError: unknown) {
    console.warn("token verify error:", verifyError)
    const body = { message: t("auth.verify.invalid_or_expired_token") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=invalid_token`)
      : NextResponse.json(body, { status: 401 })
  }

  if (typeof decoded === "string") {
    const body = { message: t("auth.verify.invalid_token_payload") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=bad_payload`)
      : NextResponse.json(body, { status: 400 })
  }

  const payload = decoded as VerifyTokenPayload

  // 5. validate payload shape (defence-in-depth)
  const isValidPayload =
    payload?.type === "email_verification" && typeof payload?.sub === "string" && typeof payload?.email === "string"
  if (!isValidPayload) {
    const body = { message: t("auth.verify.invalid_token_payload") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=bad_payload`)
      : NextResponse.json(body, { status: 400 })
  }

  const userId = payload.sub!
  const userEmail = (payload.email as string).toLowerCase().trim()

  // 6. fetch user from DB
  const { data: userRecord, error: fetchError } = await supabaseAdmin.from("users").select("*").eq("id", userId).single()
  if (fetchError) {
    console.error("fetch user error:", fetchError)
    return NextResponse.json({ message: t("auth.database.error", { message: fetchError.message }) }, { status: 500 })
  }
  if (!userRecord) {
    const body = { message: t("auth.verify.user_not_found") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=user_not_found`)
      : NextResponse.json(body, { status: 404 })
  }

  // 7. ensure token email matches DB email (defence-in-depth)
  if ((userRecord.email as string).toLowerCase().trim() !== userEmail) {
    const body = { message: t("auth.verify.email_mismatch") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=email_mismatch`)
      : NextResponse.json(body, { status: 400 })
  }

  // 8. if already verified -> success
  if (userRecord.email_verified_at) {
    const body = { message: t("auth.verify.already_verified") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=already`)
      : NextResponse.json(body, { status: 200 })
  }

  // 9. update verification timestamp
  const nowIso = new Date().toISOString()
  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from("users")
    .update({ email_verified_at: nowIso })
    .eq("id", userId)
    .select()
    .single()

  if (updateError) {
    console.error("update user error:", updateError)
    return NextResponse.json({ message: t("auth.database.error", { message: updateError.message }) }, { status: 500 })
  }

  // 10. success: redirect or json
  const body = {
    message: t("auth.verify.success"),
    user: { id: updatedUser.id, email: updatedUser.email, email_verified_at: updatedUser.email_verified_at },
  }
  return acceptHeader.includes("text/html")
    ? NextResponse.redirect(`${baseUrl}/auth/verified?status=success`)
    : NextResponse.json(body, { status: 200 })
}
