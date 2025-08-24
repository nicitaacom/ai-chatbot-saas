import { create } from "zustand"

export type TStatus = "success" | "warning" | "error" | "info"

interface Notification {
  notification?: string
  status?: TStatus
  setNotification: (status: TStatus, message: string) => void
}

const useNotification = create<Notification>(set => ({
  notification: undefined,
  status: undefined,

  setNotification: (status, message) => set({ status, notification: message }),
}))

export default useNotification
