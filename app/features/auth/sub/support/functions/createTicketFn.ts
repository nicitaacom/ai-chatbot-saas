import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import moment from "moment-timezone"

import { User } from "@/ts/namespaces/supabase"
import { Support } from "../classes/Support"
import { useLoading } from "@/stores/useLoading"
import { useSupportMessages } from "../stores/useSupportMessages"
import { rateLimit } from "@/libs/rateLimit"
import useNotification from "@/stores/useError"
import { sendMessageFn } from "./sendMessageFn"
import { useSupportTickets } from "../stores/useSupportTickets"

/**
 *
 * @param isCloudflareVerified depends on feat - turnstile cloudflare
 * @returns
 */
export async function createTicketFn(isCloudflareVerified: boolean, user: User, ticketTitle: string, router: AppRouterInstance) {
  if (!isCloudflareVerified) return

  const { setIsLoading } = useLoading.getState() // imported here because it's generic component that can be used everywhere
  const { messageBody } = useSupportMessages.getState() // imported here because it's this.feature related
  const { setSelectedTicket } = useSupportTickets.getState() // imported here because it's this.feature related
  const { setNotification } = useNotification.getState()
  const supportSDK = new Support(user.id) // imported here because it's support feature related

  try {
    setIsLoading(true)
    // 0. Validate input
    if (messageBody.length < 3) throw Error("Message body should be more then 3 symbols")
    if (ticketTitle.length < 3) throw Error("Ticket title should be more then 3 symbols")

    // 1. Check rate limit "ticket:new"
    const remainingResp = await rateLimit.ticketNew.remaining(true)
    if (typeof remainingResp === "string") throw Error(remainingResp)
    if (remainingResp.remaining === 0) throw Error("Try again later")

    // 2. Insert ticket in DB
    const insDBTcktResp = await supportSDK.insertDBTicket(ticketTitle)
    if (typeof insDBTcktResp === "string") throw Error(`Error in insDBTcktResp: ${insDBTcktResp}`)
    const created_ticket_id = insDBTcktResp[0]
    router.prefetch(`/support/${user.id}/${created_ticket_id}`)

    // 3. real-time update
    await supportSDK.triggerTicketOpen({ id: created_ticket_id, owner_username: user.user_metadata.username, owner_id: user.id })

    // 4. send tg ntfcn
    await supportSDK.sendMsgInTg(`<b>event:</b> ticket:new\n<b>subject:</b> ${ticketTitle}\n<b>message:</b> ${messageBody}`)

    // 5. send msg
    await sendMessageFn(user.id, user.user_metadata.username)

    // 6. set selected ticket (so I can sendMessage in that ticket id)
    setSelectedTicket({
      created_at: moment().toISOString(),
      id: created_ticket_id,
      is_open: true,
      owner_id: user.id,
      owner_username: user.user_metadata.username,
      rating: undefined, // because it's just created
      subject: ticketTitle,
    })
    router.push(`/support/${user.id}/${created_ticket_id}`) // this is exclution for rule DO NOT use router.push
  } catch (error) {
    console.log(43, "error in createTicketFn:", error)
    if (error instanceof Error) setNotification("error", error.message)
  }
}
