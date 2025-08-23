import { useEffect } from "react"

export const useFnOnCtrlEnter = (fn: () => void | Promise<void>) => {
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        await fn()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [fn])
}
