import { nanoid } from "nanoid"
import moment from "moment-timezone"

import { ISupportMessageDB } from "../interfaces/ISupportMessageDB"
import { useSupportMessages } from "../stores/useSupportMessages"
import { Support } from "../classes/Support"
import { useSupportTickets } from "../stores/useSupportTickets"
import useError from "@/stores/useError"
import { uploadImageFn } from "./uploadImageFn"
import { rateLimit } from "@/libs/rateLimit"

/**
 *
 * @param userId - depends on auth - that's why userId passed through prop
 * @param username - depends on auth - that's why userId passed through prop
    This function sends message in chat - uploads image if required
     0. Validate
     1. Check rate limit
     2. Upload image (if any)
     3. Insert msg in DB
     4. trigger "message:new"
     5. send tg ntfcn if lastMsg.created_at >= 60mins
     And optimistically update state obviously
 */
export async function sendMessageFn(userId: string, username: string) {
  const { messages, messageBody, image, setMessages } = useSupportMessages.getState() // it's inside of this feature
  const { selectedTicket } = useSupportTickets.getState() // it's inside of this feature
  const { error: existingError, setError } = useError.getState() // cuz it's general (not other feature)

  if (!selectedTicket) return setError("It's no selected ticket to send message")
  const supportSDK = new Support(userId)

  // 0. Validate message
  if (messageBody.trim().length === 0 && !image) return
  const newMsgId = nanoid()
  try {
    const newMessage: ISupportMessageDB = {
      id: newMsgId, // needed to set in cuurent pusher channel (for key prop in react)
      created_at: moment().toISOString(),
      ticket_id: selectedTicket.id,
      sender_id: userId, // normally you will have ticketId ?? userId but since user and support are separated projects I use that
      sender_username: username,
      // sender_avatar_url: avatarUrlCookie, // not included in message {} because if user change avatar url msgs should be updated with
      // new avatar url as well - so I will fetch user row and show avatar_url from fetched user row (ticketOwnerId it's a user.id)
      body: messageBody,
      image_url: undefined,
      seen: false,
    }
    setMessages([...messages, newMessage]) // optimistically set state

    // 1. Check rate limit
    const rateLimitResp = await rateLimit.messageNew.limit(true)
    if (typeof rateLimitResp === "string") return setError(rateLimitResp)

    // 2. Upload image (if any)
    const imgUrl = await uploadImageFn({ imageFile: image, bucket: "tickets-images", folder: userId })
    if (typeof imgUrl === "string") return setError(imgUrl)

    // optimistically set state (with uploaded image)
    if (imgUrl) setMessages([...messages.map(msg => (msg.id === newMsgId ? { ...msg, image_url: imgUrl.publicUrl } : msg))])

    // 3. insert msg in DB
    const insDBMsgResp = await supportSDK.insertDBMessage(newMessage)
    if (typeof insDBMsgResp === "string") throw Error(insDBMsgResp, { cause: "insDBMsgResp" })

    // 4. real-time update
    await supportSDK.triggerMessageNew(newMessage)

    // 5. send tg ntfcn if lastMsg.created_at >= 60mins
    const lastMsgAtISO = messages[messages.length - 1].created_at
    if (moment(newMessage.created_at).diff(moment(lastMsgAtISO), "minutes") > 60) {
      await supportSDK.sendMsgInTg(`Somebody sent new message on chat-outreach-tool\n message:${newMessage.body}`)
    }
  } catch (error) {
    setMessages(messages.filter(message => message.id !== newMsgId)) // undo state (delete sent message)

    if (error instanceof Error) {
      setError(error.message)
      if (error.cause === "insDBMsgResp") {
        const deleteDBMessageResp = await supportSDK.deleteDBMessage(newMsgId)
        if (typeof deleteDBMessageResp === "string") setError(existingError + "\n" + deleteDBMessageResp)
      }
    }
    console.log(81, "error sendMessageFn - ", error)
  }
}
