"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"

export async function updateDBTicketSeenByAction(ticketId: string, seenBy: "user" | "support") {
  // created not just 'unseen' because it's not clear unseen for who? for user or support?

  if (seenBy === "user") await supabaseAdmin.from("tickets").update({ amount_unseen_by_user: 0 }).eq("id", ticketId)
  if (seenBy === "support") await supabaseAdmin.from("tickets").update({ amount_unseen_by_support: 0 }).eq("id", ticketId)
}
