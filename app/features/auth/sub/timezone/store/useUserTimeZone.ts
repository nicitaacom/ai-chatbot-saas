import { create } from "zustand"
import moment from "moment-timezone"

interface UserTimezoneStore {
  userTimezone: string
  setUserTimezone: (timezone: string) => void
}

export const useTimezone = create<UserTimezoneStore>((set, get) => ({
  userTimezone: moment.tz.guess(),
  setUserTimezone: (timezone: string) => set({ userTimezone: timezone }),
}))

export default useTimezone
