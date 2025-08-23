"use server"

import { supabaseAdmin } from "@/libs/supabaseAdmin"

export async function deleteDBMessageAction(messageId: string): Promise<void | string> {
  const { error } = await supabaseAdmin.from("messages").delete().eq("id", messageId)
  if (error) {
    console.log(9, `error deleting message in DB ${error}`)
    return `${error.message}`
  }
}
