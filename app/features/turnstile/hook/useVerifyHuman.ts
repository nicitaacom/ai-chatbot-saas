import { RefObject, useEffect, useState } from "react"

export const useVerifyHuman = (turnstileRef: RefObject<HTMLDivElement | null>) => {
  const [isVerified, setIsVerified] = useState(process.env.NODE_ENV === "development") // State for verification status

  useEffect(() => {
    if (turnstileRef.current) {
      // @ts-expect-error turnstile doesn't exist in window
      window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY,
        callback: () => {
          setIsVerified(true) // Set verification status to true
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { isVerified }
}
