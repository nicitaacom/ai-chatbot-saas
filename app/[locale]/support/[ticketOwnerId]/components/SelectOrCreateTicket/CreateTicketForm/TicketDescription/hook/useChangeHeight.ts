import { useEffect, useState } from "react"

export const useChangeHeight = (messageBody: string) => {
  const [height, setHeight] = useState(44) // Initialize with the base height for one line

  useEffect(() => {
    // Recalculate height every time the value changes
    const lineCount = messageBody.split("\n").length

    setHeight(Math.max(38, 38 + (lineCount - 1) * 24)) // Adjust height based on line count, 24px per line
  }, [messageBody])

  return { height }
}
