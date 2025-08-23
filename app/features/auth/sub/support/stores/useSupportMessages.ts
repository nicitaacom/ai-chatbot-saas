import { ISupportMessageDB } from "@/features/auth/sub/support/interfaces/ISupportMessageDB"
import { create } from "zustand"

interface Messages {
  messages: ISupportMessageDB[]
  setMessages: (messages: ISupportMessageDB[]) => void

  isChatFilePreview: boolean
  setIsChatFilePreview: (isChatImagePreview: boolean) => void
  isChatImagePreview: Record<string, boolean>
  toggleIsImagePreview: (record: string) => void

  messageBody: string
  setMessageBody: (messageBody: string) => void

  image: File | null
  setImage: (image: File | null) => void
}

export const useSupportMessages = create<Messages>(set => ({
  isChatFilePreview: false,
  setIsChatFilePreview(isChatFilePreview: boolean) {
    set(() => ({ isChatFilePreview: isChatFilePreview }))
  },

  isChatImagePreview: {},
  toggleIsImagePreview: record => set(state => ({ isChatImagePreview: { [record]: !state.isChatImagePreview[record] } })),
  messages: [],
  messageBody: "",
  setMessageBody: messageBody => set(() => ({ messageBody })),
  image: null,
  setImage(image: File | null) {
    set(() => ({ image: image }))
  },
  setMessages(messages: ISupportMessageDB[]) {
    set(() => ({ messages }))
  },
}))
