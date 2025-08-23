"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"

export async function selectDBOpenTicketsAction(userId: string) {
  const { data: tickets, error } = await supabaseAdmin.from("tickets").select().eq("owner_id", userId).eq("is_open", true)
  if (error) {
    console.log(8, "error selecting tickets - ", error)
    return `error selecting tickets - ${error.message}`
  }
  return tickets
}
