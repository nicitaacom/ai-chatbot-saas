import { ISupportMessageDB } from "@/features/auth/sub/support/interfaces/ISupportMessageDB"
import { create } from "zustand"

interface Messages {
  messages: ISupportMessageDB[]
  setMessages: (messages: ISupportMessageDB[]) => void

  isChatFilePreview: boolean
  setIsChatFilePreview: (isChatImagePreview: boolean) => void

  isChatImagePreview: Record<string, boolean>
  toggleIsImagePreview: (record: string) => void

  image: File | null
  setImage: (image: File | null) => void
}

export const useSupportButtonMessages = create<Messages>((set, get) => ({
  isChatFilePreview: false,
  setIsChatFilePreview(isChatFilePreview: boolean) {
    set(() => ({ isChatFilePreview: isChatFilePreview }))
  },
  isChatImagePreview: {},
  toggleIsImagePreview: record => set(state => ({ isChatImagePreview: { [record]: !state.isChatImagePreview[record] } })),
  messages: [],
  image: null,
  setImage(image: File | null) {
    set(() => ({ image: image }))
  },
  setMessages(messages: ISupportMessageDB[]) {
    set(() => ({ messages }))
  },
}))
