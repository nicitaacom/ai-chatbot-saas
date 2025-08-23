import { useEffect } from "react"
import useTimezone from "../store/useUserTimeZone"

export const useSetTimezone = () => {
  const { setUserTimezone } = useTimezone()
  // use userStore to get user id and get row eq user.id then set in state
  useEffect(() => {
    // TODO - fetch user timezone from "users_tim"
  }, [])
}
