import { create } from "zustand"
import { ISupportTicketDB } from "../interfaces/ISupportTicketDB"

type SupportTickets = {
  tickets: ISupportTicketDB[]
  setTickets: (tickets: ISupportTicketDB[]) => void
  selectedTicket: ISupportTicketDB | undefined
  setSelectedTicket: (selectedTicket: ISupportTicketDB) => void
}

export const useSupportTickets = create<SupportTickets>(set => ({
  tickets: [],
  setTickets: (tickets: ISupportTicketDB[]) => set({ tickets }),
  setSelectedTicket: (selectedTicket: ISupportTicketDB) => set({ selectedTicket }),
  selectedTicket: undefined,
}))
