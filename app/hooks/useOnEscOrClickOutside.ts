"use client"

import { RefObject, useEffect } from "react"

/**
 *
 * @param ref - ref of object
 * @param actionFn - e.g () => closeFn - make sure that its arrow function to make it work
 * @param condition - if you add some condition then it check for this condition to do an actionFn()
 *
 */
const useOnEscOrClickOutside = (ref: RefObject<any>, actionFn: () => void, condition?: boolean) => {
  const isCondition = typeof condition === "undefined" ? true : condition // if prop not passed - no condition - return true

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && isCondition) {
        actionFn()
      }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Remember to add isChatImagePreview in deps
      if (event.key === "Escape") {
        actionFn()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyPress)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [actionFn, isCondition, ref])
}

export default useOnEscOrClickOutside
