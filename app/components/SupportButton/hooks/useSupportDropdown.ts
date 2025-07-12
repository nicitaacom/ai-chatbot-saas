import { create } from "zustand"

type SupportDropdownStore = {
  showMarkTicketAsCompleted: boolean
  setShowMarkTicketAsCompleted: (showMarkTicketAsCompleted: boolean) => void
  showRateThisTicket: boolean
  setShowRateThisTicket: (setShowRateThisTicket: boolean) => void
  showThankYou: boolean
  setShowThankYou: (showThankYou: boolean) => void
  isDropdown: boolean
  openDropdown: () => void
  closeDropdown: () => void
  toggle: () => void
}

export const useSupportDropdown = create<SupportDropdownStore>()((set, get) => ({
  isDropdown: false,
  showMarkTicketAsCompleted: false,
  showRateThisTicket: false,
  showThankYou: false,
  setShowMarkTicketAsCompleted: (showMarkTicketAsCompleted: boolean) =>
    set({ showMarkTicketAsCompleted: showMarkTicketAsCompleted }),
  setShowRateThisTicket: (showRateThisTicket: boolean) => set({ showRateThisTicket: showRateThisTicket }),
  setShowThankYou: (showThankYou: boolean) => set({ showThankYou: showThankYou }),

  openDropdown: () => set({ isDropdown: true }),
  closeDropdown: () => set({ isDropdown: false }),
  toggle: () => set({ isDropdown: !get().isDropdown }),
}))
