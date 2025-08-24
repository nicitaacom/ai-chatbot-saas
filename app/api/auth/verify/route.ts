// app/api/auth/verify/route.ts
/**
 * Email verification endpoint
 *
 * Flow:
 * 1. rate-limit (10/day per IP)
 * 2. verify short JWT -> get redis id
 * 3. fetch plaintext {email,password} from Redis (delete on error)
 * 4. re-check DB: if providers include "credentials" -> conflict (someone already registered)
 * 5. hash password with pepper + argon2 and insert/update users table (set email_verified_at)
 * 6. delete Redis verification record
 * 7. sign app-level auth_token (constructedUser shape) and set cookie
 * 8. redirect to frontend success page or return JSON
 *
 * NOTE: This route does NOT create a Supabase Auth user; it only manages your `users` table and app JWT.
 * If later you prefer Supabase Auth, we can switch to admin.createUser or signUp flow.
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import jwt, { JwtPayload } from "jsonwebtoken"
import argon2 from "argon2"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { getI18n } from "@/locales/server"
import type { NextRequest } from "next/server"
import type { IDBUser, User as ConstructedUser } from "@/ts/namespaces/supabase"
import { setCookie } from "@/utils/helpersSSR"

type VerifyTokenPayload = JwtPayload & { id?: string; type?: string }
type RLResp = { ok: boolean; reset?: number; remaining?: number; reason?: string }

const RATE_LIMIT_KEY = "email:verify"
const RATE_LIMIT = 10
const RATE_LIMIT_WINDOW = "1d" // per-day

const redis = Redis.fromEnv()

async function applyRateLimit(ip: string, key = RATE_LIMIT_KEY, limit = RATE_LIMIT, window = RATE_LIMIT_WINDOW): Promise<RLResp> {
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

export async function GET(req: NextRequest) {
  const t = await getI18n()
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) return NextResponse.json({ message: t("auth.server.missing_jwt_secret") }, { status: 500 })

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const acceptHeader = headers().get("accept") ?? ""
  const ip = headers().get("x-real-ip") || headers().get("x-forwarded-for") || "127.0.0.1"

  // 1. rate-limit
  const rl = await applyRateLimit(ip)
  if (!rl.ok) {
    const now = Date.now()
    const retryAfter = rl.reset ? Math.max(0, Math.floor((rl.reset - now) / 1000)) : 60
    return new NextResponse(`Please try again in ${retryAfter} seconds`, {
      status: 429,
      headers: { "retry-after": `${retryAfter}` },
    })
  }

  // 2. parse token
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  if (!token) {
    const body = { message: t("auth.verify.missing_token") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=missing_token`)
      : NextResponse.json(body, { status: 400 })
  }

  // 3. verify JWT type-safely
  let decoded: string | JwtPayload
  try {
    decoded = jwt.verify(token, jwtSecret)
  } catch (verifyErr: unknown) {
    console.warn("verify error:", verifyErr)
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
  if (payload?.type !== "email_verification" || typeof payload?.id !== "string") {
    const body = { message: t("auth.verify.invalid_token_payload") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=bad_payload`)
      : NextResponse.json(body, { status: 400 })
  }

  // 4. fetch Redis temporary record
  const redisKey = `verify:${payload.id}`
  let stored: string | null = null
  try {
    stored = (await redis.get(redisKey)) as string | null
  } catch (err) {
    console.error("redis get error:", err)
    return NextResponse.json({ message: t("auth.server.invalid_data") }, { status: 500 })
  }
  if (!stored) {
    const body = { message: t("auth.verify.invalid_or_expired_token") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=expired`)
      : NextResponse.json(body, { status: 401 })
  }

  // 5. parse stored plaintext payload
  let tmp: { email: string; password: string }
  try {
    tmp = JSON.parse(stored) as { email: string; password: string }
  } catch (err) {
    console.error("bad redis payload:", err)
    await redis.del(redisKey).catch(() => void 0)
    return NextResponse.json({ message: t("auth.server.invalid_data") }, { status: 500 })
  }
  const email = tmp.email.toLowerCase().trim()
  const password = tmp.password

  // 6. re-check DB (race-safe)
  const { data: existingUser, error: checkError } = await supabaseAdmin.from("users").select("*").eq("email", email).single()
  if (checkError && checkError.code !== "PGRST116") {
    console.error("db check error:", checkError)
    await redis.del(redisKey).catch(() => void 0)
    return NextResponse.json({ message: t("auth.database.error_finding_user", { message: checkError.message }) }, { status: 500 })
  }
  if (existingUser && existingUser.providers?.includes("credentials")) {
    // someone registered between registration and verification
    await redis.del(redisKey).catch(() => void 0)
    const body = { message: t("auth.register.user_already_exists") }
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=user_exists`)
      : NextResponse.json(body, { status: 409 })
  }

  // 7. hash password with pepper + create/update DB row
  const pepper = process.env.PASSWORD_SECRET
  if (!pepper) {
    await redis.del(redisKey).catch(() => void 0)
    return NextResponse.json({ message: t("auth.server.missing_password_secret") }, { status: 500 })
  }

  let dbUser: IDBUser | null = null
  try {
    const encrypted_password = await argon2.hash(`${pepper}:${password}`, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    })

    if (existingUser) {
      // attach credentials to existing user (e.g. oauth user)
      const updated: Partial<IDBUser> = {
        encrypted_password,
        providers: Array.from(new Set([...(existingUser.providers ?? []), "credentials"])),
        email_verified_at: new Date().toISOString(),
      }
      const { data: updatedRow, error: updateError } = await supabaseAdmin
        .from("users")
        .update(updated)
        .eq("id", existingUser.id)
        .select()
        .single()
      if (updateError) throw updateError
      dbUser = updatedRow as IDBUser
    } else {
      // create new users table row
      const newRow: IDBUser = {
        id: crypto.randomUUID(), // your own id generator - ensure uniqueness
        email,
        encrypted_password,
        providers: ["credentials"],
        email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        roles: ["USER"],
        username: "",
        is_otp_enabled: false,
      }
      const { data: inserted, error: insertError } = await supabaseAdmin.from("users").insert([newRow]).select().single()
      if (insertError) throw insertError
      dbUser = inserted as IDBUser
    }
  } catch (err) {
    console.error("create/update user error:", err)
    await redis.del(redisKey).catch(() => void 0)
    const message = (err as any)?.message ?? "user_create_failed"
    return acceptHeader.includes("text/html")
      ? NextResponse.redirect(`${baseUrl}/auth/verified?status=error&reason=create_failed`)
      : NextResponse.json({ message: t("auth.database.error", { message }) }, { status: 500 })
  }

  // 8. cleanup Redis (used key)
  await redis.del(redisKey).catch(() => void 0)

  // 9. sign app-level JWT and set cookie so your supabaseServer() helper picks it up
  const constructedUser: ConstructedUser = { user: dbUser as any, session: null } // session null: you manage sessions with this jwt
  const appJwt = jwt.sign(constructedUser, process.env.JWT_SECRET!, { expiresIn: "1h" })
  setCookie("auth_token", appJwt)

  // 10. success -> redirect or json
  const body = {
    message: t("auth.verify.success"),
    user: { id: dbUser!.id, email: dbUser!.email, email_verified_at: dbUser!.email_verified_at },
  }
  return acceptHeader.includes("text/html")
    ? NextResponse.redirect(`${baseUrl}/auth/verified?status=success`)
    : NextResponse.json(body, { status: 200 })
}
