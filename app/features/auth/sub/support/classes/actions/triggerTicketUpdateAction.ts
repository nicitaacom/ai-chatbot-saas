"use server"

import { getPusherServer } from "@/libs/Pusher/pusher"
import { ISupportTicketDB } from "../../interfaces/ISupportTicketDB"

/**
 *
 * @param ticketId - ticket id (not tickets owner id)
 * @param is_open - to close ticket if user close it
 */
export async function triggerTicketUpdateAction(ticket: Pick<ISupportTicketDB, "id" | "is_open">) {
  const pusherServer = getPusherServer()

  // Trigger 'ticket:open' event in 'tickets' channel to add new ticket in DesktopSidebar on support side
  await pusherServer.trigger("tickets", "ticket:update", {
    id: ticket.id, // to router push on correct url [ticketId]
    is_open: ticket.is_open,
  })
}
