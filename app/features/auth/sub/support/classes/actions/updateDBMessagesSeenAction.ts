"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"

/**
 * @param ticketId - ticket owner id (its only user - I don't let support open ticket)
 * @param userId - Account's owner id. You may get userId by using getUserIdCSR()
 */
export async function updateDBMessagesSeenAction(ticketId: string, userId: string) {
  // 2. Update in DB in 'messages' table - not seen messages to seen:true
  const { error } = await supabaseAdmin
    .from("messages")
    .update({ seen: true })
    .eq("seen", false)
    .eq("ticket_id", ticketId)
    .neq("sender_id", userId)
  if (error) console.log(17, "error updateDBMessagesSeenAction - ", error)
}
