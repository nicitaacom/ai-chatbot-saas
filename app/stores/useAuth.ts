import { create } from "zustand"
import { TAuthMode } from "@/TS/types/TAuthMode"

export interface Toast {
  authMode: TAuthMode
  setauthMode: (mode: TAuthMode) => void
}

export const useAuth = create<Toast>((set, get) => ({
  authMode: "login",
  setauthMode: authMode => set(() => ({ authMode })),
}))

export default useAuth
