"use server"

import { getPusherServer } from "@/libs/Pusher/pusher"
import { ISupportMessageDB } from "@/features/auth/sub/support/interfaces/ISupportMessageDB"

export async function triggerMessageNewAction(message: ISupportMessageDB): Promise<void> {
  const pusherServer = getPusherServer()

  await pusherServer.trigger(message.ticket_id, "message:new", message)
}
