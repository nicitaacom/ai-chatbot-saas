import { ISupportMessageDB } from "@/features/auth/sub/support/interfaces/ISupportMessageDB"
import { ISupportTicketDB } from "@/features/auth/sub/support/interfaces/ISupportTicketDB"

export type PusherEventMap = {
  "message:new": ISupportMessageDB
  "messages:seen": boolean

  "ticket:new": ISupportTicketDB
  "ticket:open": Pick<ISupportTicketDB, "id" | "owner_username" | "owner_id">
  "ticket:update": any // TODO - complicated - don't want to waste time on this
  "ticket:close": Pusher.TicketClose
}

export type EventName = keyof PusherEventMap
