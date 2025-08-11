import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { User } from "@/ts/namespaces/supabase"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { insertInUsersFn } from "../functions/insertInUsersFn"
import { insertInSubscriptionsFn } from "../functions/insertInSubscriptionsFn"
import { TProviders } from "@/ts/types/TProviders"
import { providers } from "@/consts/providers"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const locale = url.searchParams.get("locale")
  const supportUrl = (subject: string) => `${origin}/${locale}/support?ticket_subject=${encodeURIComponent(subject)}`

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

    // get data about provider to save it in DB to throw error like
    // 'You already have signed in account with google - continue with google?'
    const provider = url.searchParams.get("provider")
    if (!provider) return NextResponse.redirect(supportUrl("[AUTH]: no provider but continued with some provider e.g google"))
    if (!providers.includes(provider as TProviders)) {
      return NextResponse.redirect(supportUrl(`[AUTH]: invalid provider '${provider}'`))
    }

    // 1. Insert in "users" table
    const insertInUsersResp = await insertInUsersFn(userData, provider as TProviders)
    if (typeof insertInUsersResp === "string") return NextResponse.redirect(supportUrl(insertInUsersResp))

    // 2. Insert in "subscription" table
    const insertInSubscriptionResp = await insertInSubscriptionsFn(userData)
    if (typeof insertInSubscriptionResp === "string") return NextResponse.redirect(supportUrl(insertInSubscriptionResp))

    return NextResponse.redirect(url.origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(supportUrl(`[AUTH ERROR]: ${message}`))
  }
}
