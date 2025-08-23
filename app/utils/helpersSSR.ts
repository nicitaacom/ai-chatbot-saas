//This helpers may be used on server side only
import { cookies } from "next/headers"
import { TCookieName } from "../ts/types/TCookieName"

/**
 * Get typed cookie value by name with autocomplete
 * @param name - Cookie name with autocomplete support
 * @returns Cookie value as string or undefined if not found
 */
export function getCookie(name: TCookieName): string | undefined {
  return cookies().get(name)?.value
}

/**
 * Set typed cookie value by name with autocomplete
 * @param name - Cookie name with autocomplete support
 * @param value - Cookie value to set
 * @param maxAgeSeconds - Optional expiration time in seconds from now (defaults to 3600, i.e., 1 hour)
 */
export function setCookie(name: TCookieName, value: string, maxAgeSeconds: number = 3600): void {
  cookies().set(name, value, {
    httpOnly: true, // Prevent JavaScript access using document.cookie to protect against XSS
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Protect against CSRF
    maxAge: maxAgeSeconds, // Flexible expiration in seconds
  })
}
