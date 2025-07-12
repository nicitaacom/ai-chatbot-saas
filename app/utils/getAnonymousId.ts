import { nanoid } from "nanoid"

/**
 *
 * @returns userId from state (in case user authenticated)
 * anonymousId from cookies (in case user not authenticated)
 */
const getOrSetAnonymousIdFromLS = (): string => {
  let storedId = localStorage.getItem("anonymousId")

  let newAnonymousId = ""
  const anonymousId = storedId

  if (!anonymousId)
    newAnonymousId = `anonymousId_${nanoid()}` // 1. generate
  else return anonymousId

  localStorage.setItem("anonymousId", newAnonymousId)

  return newAnonymousId
}

export default getOrSetAnonymousIdFromLS
