import { TCookieName } from "@/ts/types/TCookieName"

export function setCookie(name: TCookieName, val: string) {
  if (typeof document === "undefined") return

  const date = new Date()
  const value = val

  // Set it expire in 7 days
  date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Set it
  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/"
}

export function getCookie(name: TCookieName) {
  if (typeof document === "undefined") return

  const value = "; " + document.cookie
  const decodedValue = decodeURIComponent(value)
  const parts = decodedValue.split("; " + name + "=")

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift()
  }
}

export function getAllCookies() {
  if (typeof document === "undefined") return {}

  const cookieString = document.cookie
  const cookies: Record<string, string> = {}

  cookieString.split(";").forEach(cookie => {
    const [name, value] = cookie.split("=").map(c => c.trim())
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value)
    }
  })

  return cookies
}
