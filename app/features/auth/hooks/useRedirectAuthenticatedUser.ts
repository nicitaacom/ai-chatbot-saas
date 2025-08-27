import { useRouter } from "next/navigation"

import { useEffect, useState } from "react"
import useAuth from "../stores/useAuth"

export const useIsUserAuthenticated = (auth_token: string | undefined) => {
  const router = useRouter()
  const { setUser, setUserId } = useAuth()

  useEffect(() => {
    setTimeout(() => {
      if (auth_token) {
        router.push("/dashboard")
      }
    }, 2500)
  }, [router])

  return { isAuthenticated: !!auth_token }
}
