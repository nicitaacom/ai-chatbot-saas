import { TPlanName } from "@/ts/types/TPlanName"
import { getTicketsLimitsAction } from "./actions/getTicketsLimitsAction"
import { insertDBMessageAction } from "./actions/insertDBMessageAction"
import { ISupportMessageDB } from "../interfaces/ISupportMessageDB"
import { insertDBTicketAction } from "./actions/insertDBTicketAction"
import { selectDBMessagesAction } from "./actions/selectDBMessagesAction"
import { selectDBOpenTicketsAction } from "./actions/selectDBOpenTicketsAction"
import { ISupportTicketDB } from "@/features/auth/sub/support/interfaces/ISupportTicketDB"
import { sendMsgInTgAction } from "./actions/sendMsgInTgAction"
import { triggerIsTypingAction } from "./actions/triggerIsTypingAction"
import { triggerMessageNewAction } from "./actions/triggerMessageNewAction"
import { triggerMessagesSeenAction } from "./actions/triggerMessagesSeenAction"
import { triggerTicketOpenAction } from "./actions/triggerTicketOpenAction"
import { triggerTicketUpdateAction } from "./actions/triggerTicketUpdateAction"
import { updateDBMessagesSeenAction } from "./actions/updateDBMessagesSeenAction"
import { updateDBTicketSeenByAction } from "./actions/updateDBTicketSeenByAction"
import { deleteDBMessageAction } from "./actions/deleteDBMessageAction"

export class Support {
  constructor(private userId: string) {}

  async getTicketsLimits(planName: TPlanName): Promise<number> {
    const ticketsLimits = await getTicketsLimitsAction(planName)

    return ticketsLimits
  }

  async insertDBMessage(message: ISupportMessageDB): Promise<void | string> {
    const insertDBMessageResp = await insertDBMessageAction(message)
    return insertDBMessageResp
  }

  async insertDBTicket(ticketSubject: string): Promise<[string] | string> {
    const insertDBTicketResp = await insertDBTicketAction(this.userId, ticketSubject)
    if (typeof insertDBTicketResp === "string") return insertDBTicketResp
    return [insertDBTicketResp.created_ticket_id]
  }

  async selectDBMessages(ticketId: string): Promise<ISupportMessageDB[] | string> {
    const selectDBMessagesResp = await selectDBMessagesAction(ticketId)
    return selectDBMessagesResp
  }

  async selectDBOpenTickets(): Promise<ISupportTicketDB[] | string> {
    const selectDBOpenTicketsResp = await selectDBOpenTicketsAction(this.userId)
    return selectDBOpenTicketsResp
  }

  async sendMsgInTg(messageBody: string): Promise<void> {
    const selectDBOpenTicketsResp = await sendMsgInTgAction(messageBody)
    return selectDBOpenTicketsResp
  }

  async triggerIsTyping(isTyping: boolean): Promise<void> {
    await triggerIsTypingAction(this.userId, isTyping)
  }

  async triggerMessageNew(message: ISupportMessageDB): Promise<void> {
    await triggerMessageNewAction(message)
  }

  async triggerMessagesSeen(channel: string): Promise<void> {
    await triggerMessagesSeenAction(channel)
  }

  async triggerTicketOpen(ticket: Pick<ISupportTicketDB, "id" | "owner_username" | "owner_id">): Promise<void> {
    await triggerTicketOpenAction(ticket)
  }

  async triggerTicketUpdate(ticket: Pick<ISupportTicketDB, "id" | "is_open">): Promise<void> {
    await triggerTicketUpdateAction(ticket)
  }

  async updateDBMessagesSeen(ticketId: string): Promise<void> {
    await updateDBMessagesSeenAction(ticketId, this.userId)
  }

  async updateDBTicketSeenBy(ticketId: string, seenBy: "user" | "support"): Promise<void> {
    await updateDBTicketSeenByAction(ticketId, seenBy)
  }

  async deleteDBMessage(messageId: string): Promise<void | string> {
    return await deleteDBMessageAction(messageId)
  }
}
