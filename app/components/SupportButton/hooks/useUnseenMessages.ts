import { create } from "zustand"

import getOrSetAnonymousIdFromLS from "@/utils/getAnonymousId"
import { ISupportMessageDB } from "@/features/auth/sub/support/interfaces/ISupportMessageDB"

type UnseenMessagesStore = {
  unseenMessagesNumber: number
  setIncreaseUnseenMessages: () => void
  setClearUnseenMessages: () => void
  initialize: (initialMessages: ISupportMessageDB[]) => void
}

export const useUnseenMessagesStore = create<UnseenMessagesStore>()(set => ({
  unseenMessagesNumber: 0,

  setIncreaseUnseenMessages() {
    set(state => ({
      unseenMessagesNumber: state.unseenMessagesNumber + 1,
    }))
  },

  setClearUnseenMessages() {
    set(() => ({
      unseenMessagesNumber: 0,
    }))
  },

  initialize(initialMessages: ISupportMessageDB[]) {
    const userId = getOrSetAnonymousIdFromLS() // get userId based on authenticaed user on not
    const unseenAmount = initialMessages.filter(
      message => message.ticket_id === userId && message.seen === false && message.sender_id !== userId,
    ).length
    set(() => ({
      unseenMessagesNumber: unseenAmount,
    }))
  },
}))
