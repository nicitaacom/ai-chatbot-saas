import { create } from "zustand"

type IsTypingStore = {
  isTyping: boolean
  setIsTyping: (isTyping: boolean) => void
}

export const useIsTyping = create<IsTypingStore>(set => ({
  isTyping: false,
  setIsTyping: (isTyping: boolean) => set({ isTyping }),
}))
