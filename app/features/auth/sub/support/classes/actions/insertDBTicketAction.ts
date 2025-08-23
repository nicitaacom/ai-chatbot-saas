"use server"

import supabaseAdmin from "@/libs/supabaseAdmin"

export async function insertDBTicketAction(
  userId: string,
  ticketSubject: string,
): Promise<{ created_ticket_id: string } | string> {
  const { data, error: error_selecting_user } = await supabaseAdmin.auth.getUser()

  if (error_selecting_user) return error_selecting_user.message

  const { data: created_ticket, error } = await supabaseAdmin
    .from("tickets")
    .insert({
      subject: ticketSubject,
      owner_username: data.user?.user_metadata.username,
      owner_id: userId,
    })
    .select()
    .single()
  if (error) {
    console.log(31, "error inserting ticket - ", error)
    return `error inserting ticket in DB - ${error.message}`
  }
  if (!created_ticket?.id) return "No created_ticket.id"

  return { created_ticket_id: created_ticket.id }
}
