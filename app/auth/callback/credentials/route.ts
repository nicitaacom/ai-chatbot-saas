import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { User } from "@/ts/namespaces/supabase"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { insertInUsersFn } from "../functions/insertInUsersFn"
import { insertInSubscriptionsFn } from "../functions/insertInSubscriptionsFn"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const supportUrl = (subject: string) => `${origin}/support?ticket_subject=${encodeURIComponent(subject)}`

  // Get code and check for errors
  const code = url.searchParams.get("code")
  const errorDesc = url.searchParams.get("error_description")

  if (errorDesc) {
    return NextResponse.redirect(supportUrl(`[AUTH]: ${errorDesc}`))
  }

  if (!code) {
    return NextResponse.redirect(supportUrl("[AUTH]: no code"))
  }

  try {
    // Exchange code for session
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    )

    const {
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code)

    if (!user || !user.email) {
      return NextResponse.redirect(supportUrl("[AUTH]: no response.data.user"))
    }

    const userData = user as User

    // 1. Insert in "users" table
    const insertInUsersResp = await insertInUsersFn(userData, "credentials")
    if (typeof insertInUsersResp === "string") return NextResponse.redirect(supportUrl(insertInUsersResp))

    // 2. Insert in "subscription" table
    const insertInSubscriptionResp = await insertInSubscriptionsFn(userData)
    if (typeof insertInSubscriptionResp === "string") return NextResponse.redirect(supportUrl(insertInSubscriptionResp))

    return NextResponse.redirect(origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(supportUrl(`[AUTH ERROR]: ${message}`))
  }
}
