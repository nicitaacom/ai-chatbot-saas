import { IMessageDB } from "@/TS/interfaces/IMessageDB"
import { create } from "zustand"

interface MessagesStore {
  messages: IMessageDB[]
  setMessages: (messages: IMessageDB[]) => void

  isChatFilePreview: boolean
  setIsChatFilePreview: (isChatImagePreview: boolean) => void
  isChatImagePreview: Record<string, boolean>
  toggleIsImagePreview: (record: string) => void
  image: File | null
  setImage: (image: File | null) => void
}

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  isChatFilePreview: false,
  setIsChatFilePreview(isChatFilePreview: boolean) {
    set(() => ({ isChatFilePreview: isChatFilePreview }))
  },
  isChatImagePreview: {},
  toggleIsImagePreview: record =>
    set(state => ({ isChatImagePreview: { [record]: !state.isChatImagePreview[record] } })),
  messages: [],
  image: null,
  setImage(image: File | null) {
    set(() => ({ image: image }))
  },
  setMessages(messages: IMessageDB[]) {
    set(() => ({ messages }))
  },
}))
