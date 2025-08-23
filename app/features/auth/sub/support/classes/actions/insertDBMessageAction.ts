"use server"

import { supabaseAdmin } from "@/libs/supabaseAdmin"
import { ISupportMessageDB } from "@/features/auth/sub/support/interfaces/ISupportMessageDB"

export async function insertDBMessageAction(message: ISupportMessageDB): Promise<void | string> {
  const { error } = await supabaseAdmin.from("messages").insert(message)
  if (error) {
    console.log(9, `error inserting message in DB ${error}`)
    return `${error.message}`
  }
}
