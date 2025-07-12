import { create } from "zustand"

import getOrSetAnonymousIdFromLS from "@/utils/getAnonymousId"
import { IMessageDB } from "@/interfaces/IMessageDB"

type UnseenMessagesStore = {
  unseenMessagesNumber: number
  setIncreaseUnseenMessages: () => void
  setClearUnseenMessages: () => void
  initialize: (initialMessages: IMessageDB[]) => void
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

  initialize(initialMessages: IMessageDB[]) {
    const userId = getOrSetAnonymousIdFromLS() // get userId based on authenticaed user on not
    const unseenAmount = initialMessages.filter(
      message => message.ticket_id === userId && message.seen === false && message.sender_id !== userId,
    ).length
    set(() => ({
      unseenMessagesNumber: unseenAmount,
    }))
  },
}))
