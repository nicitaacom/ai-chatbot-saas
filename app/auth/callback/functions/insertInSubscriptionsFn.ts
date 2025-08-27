import { User } from "@supabase/supabase-js"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { getFreeSubscription } from "@/utils/getFreeSubscription"

export async function insertInSubscriptionsFn(userData: User) {
  const { data, error: subscriptions_error } = await supabaseAdmin.from("subscriptions").select("*").eq("user_id", userData.id)
  if (subscriptions_error && !subscriptions_error.message.includes("multiple (or no) rows returned"))
    return `[AUTH]: ${subscriptions_error.message}`
  if (!data) await supabaseAdmin.from("subscriptions").insert(getFreeSubscription(userData.id))
}
