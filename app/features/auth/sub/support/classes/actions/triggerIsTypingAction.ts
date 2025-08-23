"use server"

import { getPusherServer } from "@/libs/Pusher/pusher"

/**
 * trigger isTyping state for userId
 */
export async function triggerIsTypingAction(userId: string, isTyping: boolean) {
  const pusherServer = getPusherServer()

  await pusherServer.trigger(`${userId}-isTyping`, "user:isTyping", isTyping)
}
