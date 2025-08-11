import { create } from "zustand"
import { TAuthMode } from "@/ts/types/TAuthMode"

export interface Toast {
  authMode: TAuthMode
  setAuthMode: (mode: TAuthMode) => void
  authError: string
  setAuthError: (authError: string) => void
}

export const useAuth = create<Toast>((set, get) => ({
  authMode: "login",
  setAuthMode: authMode => set(() => ({ authMode })),
  authError: "",
  setAuthError: authError => set(() => ({ authError })),
}))

export default useAuth
