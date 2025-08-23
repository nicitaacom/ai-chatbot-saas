"use server"

import { getPusherServer } from "@/libs/Pusher/pusher"

/**
 * @param channel - You may get channel in two ways:
 * 1. On a support account: from params.ticketId
 * 2. On a user account: using supabaseServer().auth.getUser() or getCookie("anonymousId")
 *
 * @param userId - Current user id
 */
export async function triggerMessagesSeenAction(channel: string) {
  const pusherServer = getPusherServer()

  // bind on support side - so support see user red messages or not
  await pusherServer.trigger(channel, "messages:seen", true)
}
