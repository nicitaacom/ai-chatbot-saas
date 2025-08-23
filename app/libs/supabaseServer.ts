import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Database } from "@/ts/types_db"
import { TCookieName } from "@/ts/types/TCookieName"
import { getCookie } from "@/utils/helpersSSR"

const supabaseServer = () => {
  // Get the auth_token cookie using your typed utility
  const authToken = getCookie("auth_token" as TCookieName)

  // Create Supabase client with correct arguments
  const supabase = createServerComponentClient<Database>(
    { cookies: () => cookies() }, // First argument: context with cookies
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      options: {
        global: {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        },
      },
    }, // Second argument: options including supabaseUrl and supabaseKey
  )

  return supabase
}

export default supabaseServer
