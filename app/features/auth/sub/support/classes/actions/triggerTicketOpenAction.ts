"use server"

import { getPusherServer } from "@/libs/Pusher/pusher"
import { ISupportTicketDB } from "../../interfaces/ISupportTicketDB"

/**
 *
 * @param ownerId - ticket owner userId
 * @param username - current user username
 * @param avatarUrl - user avatar url (may be null)
 * @param messageBody - message that user enter in input
 * @param ownerId - current user id
 */
export async function triggerTicketOpenAction(ticket: Pick<ISupportTicketDB, "id" | "owner_username" | "owner_id">) {
  const pusherServer = getPusherServer()

  // 2. Trigger 'ticket:open' event in 'tickets' channel to add new ticket in DesktopSidebar on support side
  await pusherServer.trigger("tickets", "ticket:open", {
    id: ticket.id, // to router push on correct url [ticketId]
    owner_username: ticket.owner_username, // to show it on MessagesHeader.tsx
    owner_id: ticket.owner_id,
  })
}
