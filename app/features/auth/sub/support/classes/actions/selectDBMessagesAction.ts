import supabaseAdmin from "@/libs/supabaseAdmin"

export const selectDBMessagesAction = async (ticketId: string) => {
  const { data: messages_by_id_response, error: messages_by_id_error } = await supabaseAdmin
    .from("messages")
    .select()
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true }) // from from new to old
  if (messages_by_id_error) console.log(9, "messages_by_id_error - ", messages_by_id_error.message)
  if (messages_by_id_response?.length === 0 || messages_by_id_response === null) return []
  return messages_by_id_response
}
