import { create } from "zustand"
import { User } from "@/ts/namespaces/supabase"
import { TAuthMode } from "../types/TAuthMode"

interface Auth {
  userId: string
  setUserId: (userId: string) => void

  emailInputValue: string
  setEmailInputValue: (value: string) => void
  emailInputError: string
  setEmailInputError: (error: string) => void

  passwordInputValue: string
  setPasswordInputValue: (value: string) => void
  passwordInputError: string
  setPasswordInputError: (value: string) => void

  authMode: TAuthMode
  setAuthMode: (mode: TAuthMode) => void

  user?: User
  setUser: (user: User) => void
}

export const useAuth = create<Auth>(set => ({
  userId: "",
  setUserId: userId => set(() => ({ userId })),

  emailInputValue: "",
  setEmailInputValue: emailInputValue => set(() => ({ emailInputValue })),
  emailInputError: "",
  setEmailInputError: emailInputError => set(() => ({ emailInputError })),

  passwordInputValue: "",
  setPasswordInputValue: passwordInputValue => set(() => ({ passwordInputValue })),
  passwordInputError: "",
  setPasswordInputError: passwordInputError => set(() => ({ passwordInputError })),

  authMode: "login",
  setAuthMode: authMode => set(() => ({ authMode })),

  setUser(user: User) {
    set(() => ({
      user,
    }))
  },
}))

export default useAuth
