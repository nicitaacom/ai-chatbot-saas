import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { User } from "@/ts/namespaces/supabase"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { insertInUsersFn } from "../functions/insertInUsersFn"
import { insertInSubscriptionsFn } from "../functions/insertInSubscriptionsFn"
import { TProviders } from "@/ts/types/TProviders"
import { providers } from "@/features/auth/consts/providers"
import { getCookie, setCookie } from "@/utils/helpersSSR"
import { nanoid } from "nanoid"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const locale = url.searchParams.get("locale")

  let anonymousId = getCookie("anonymousId")

  // TODO: auth - then click "back" ctrl+leftarrow - see what happens - if redirects to support with "invalid flow state" then it's fine
  if (!anonymousId) {
    anonymousId = `anonymousId_${nanoid()}`
    setCookie("anonymousId", anonymousId)
  }

  const supportUrlAnonymousId = (subject: string) =>
    `${origin}/${locale}/support/${anonymousId}?ticket_subject=${encodeURIComponent(subject)}`

  // Get code and check for errors
  const code = url.searchParams.get("code")
  const errorDesc = url.searchParams.get("error_description")

  if (errorDesc) {
    return NextResponse.redirect(supportUrlAnonymousId(`[AUTH]: ${errorDesc}`))
  }

  if (!code) {
    return NextResponse.redirect(supportUrlAnonymousId("[AUTH]: no code"))
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
      return NextResponse.redirect(supportUrlAnonymousId("[AUTH]: no response.data.user"))
    }

    const supportUrlUserId = (subject: string) =>
      `${origin}/${locale}/support/${user.id}?ticket_subject=${encodeURIComponent(subject)}`

    const userData = user as User

    // get data about provider to save it in DB to throw error like
    // 'You already have signed in account with google - continue with google?'
    const provider = url.searchParams.get("provider")
    if (!provider)
      return NextResponse.redirect(supportUrlUserId("[AUTH]: no provider but continued with some provider e.g google"))
    if (!providers.includes(provider as TProviders)) {
      return NextResponse.redirect(supportUrlUserId(`[AUTH]: invalid provider '${provider}'`))
    }

    // 1. Insert in "users" table
    const insertInUsersResp = await insertInUsersFn(userData, provider as TProviders)
    if (typeof insertInUsersResp === "string") return NextResponse.redirect(supportUrlUserId(insertInUsersResp))

    // 2. Insert in "subscription" table
    const insertInSubscriptionResp = await insertInSubscriptionsFn(userData)
    if (typeof insertInSubscriptionResp === "string") return NextResponse.redirect(supportUrlUserId(insertInSubscriptionResp))

    return NextResponse.redirect(url.origin)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.redirect(supportUrlAnonymousId(`[AUTH ERROR]: ${message}`))
  }
}
