import { create } from "zustand"

type MarkTicketAsCompleted = {
  showRateThisTicket: boolean
  showMarkTicketAsCompleted: boolean
  showThankYou: boolean
  setShowRateThisTicket: (showRateThisTicket: boolean) => void
  setShowMarkTicketAsCompleted: (showMarkTicketAsCompleted: boolean) => void
  setShowThankYou: (showThankYou: boolean) => void
}

export const useMarkTicketAsCompleted = create<MarkTicketAsCompleted>(set => ({
  showRateThisTicket: false,
  showMarkTicketAsCompleted: false,
  showThankYou: false,
  setShowRateThisTicket: (showRateThisTicket: boolean) => set({ showRateThisTicket }),
  setShowMarkTicketAsCompleted: (showMarkTicketAsCompleted: boolean) => set({ showMarkTicketAsCompleted }),
  setShowThankYou: (showThankYou: boolean) => set({ showThankYou }),
}))
