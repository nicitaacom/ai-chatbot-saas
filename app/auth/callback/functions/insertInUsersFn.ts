import supabaseAdmin from "@/libs/supabaseAdmin"
import { User } from "@/ts/namespaces/supabase"
import { TProviders } from "@/ts/types/TProviders"

/**
 *
 * This function insert user in "users" table IF NOT EXISTS
 */
export async function insertInUsersFn(userData: User, provider: TProviders): Promise<void | string> {
  if (typeof window === "undefined") {
    const { data: existing_user, error } = await supabaseAdmin
      .from("users")
      .select("username,providers")
      .eq("id", userData.id)
      .single()
    if (error && !error.message.includes("multiple (or no) rows returned")) return `[AUTH]: ${error.message} (insertInUsersFn)`

    if (!existing_user) {
      const avatarUrl =
        userData.user_metadata.avatar_url ||
        userData.user_metadata.picture ||
        userData?.identities?.[0]?.identity_data?.avatar_url ||
        userData?.identities?.[1]?.identity_data?.avatar_url ||
        ""
      const { error: insert_error } = await supabaseAdmin.from("users").insert({
        id: userData.id,
        username: userData.user_metadata.username,
        email: userData.user_metadata.username,
        avatar_url: avatarUrl,
        providers: [provider],
      })

      if (insert_error) return `[AUTH]: ${insert_error.message} (insertInUsersFn)`
    } else {
      const { data: existingUser, error } = await supabaseAdmin.from("users").select("providers").eq("id", userData.id).single()
      if (error) return `[AUTH:] ${error.message} (insertInUsersFn)`
      if (!existingUser.providers) return `[AUTH]: no existing providers but user exists`

      // if provider already in providers, skip update
      if (existingUser.providers.includes(provider)) return

      const updatedProviders = [...existingUser.providers, provider]
      await supabaseAdmin
        .from("users")
        // email_confirmed_at only updated once (on email confirmed)
        .update({ email_confirmed_at: userData.updated_at, providers: updatedProviders })
        .eq("id", userData.id)
    }
  } else return "This function must be runned on server only"
}
