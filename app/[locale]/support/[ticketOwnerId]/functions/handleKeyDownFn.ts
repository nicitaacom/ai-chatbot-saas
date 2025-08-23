import { Dispatch, RefObject, SetStateAction } from "react"

import { User } from "@/ts/namespaces/supabase"
import useToast from "@/store/useToast"
import { uploadImagesAndSendMessage } from "./uploadImagesAndSendMessage"

export async function handleKeyDownFn(
  event: React.KeyboardEvent<HTMLTextAreaElement>,
  inputValue: string,
  setMessageBody: (value: string) => void,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  setHeight: Dispatch<SetStateAction<number>>,
  image: File | null,
  ticketId: string,
  user: User,
) {
  const toast = useToast.getState()

  if (event.key === "Enter") {
    if (event.shiftKey) {
      event.preventDefault() // Prevent default behavior for Shift+Enter

      // Insert newline at the current cursor position
      const cursorPosition = event.currentTarget.selectionStart
      const beforeText = inputValue.slice(0, cursorPosition)
      const afterText = inputValue.slice(cursorPosition)
      const newValue = `${beforeText}\n${afterText}`
      setMessageBody(newValue) // Update value to trigger height recalculation

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.value = newValue
          textareaRef.current.setSelectionRange(cursorPosition + 1, cursorPosition + 1)
          // Adjust scrollTop to ensure the new line and cursor are visible
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight

          // Recalculate height based on updated value
          const lineCount = newValue.split("\n").length
          setHeight(Math.max(38, 38 + (lineCount - 1) * 24))
        }
      }, 0)
    } else {
      event.preventDefault() // Prevent default form submission on Enter
      // Trim and check if the message is not just spaces or newlines
      if (inputValue.trim().length > 0 || image) {
        await uploadImagesAndSendMessage(setMessageBody, setHeight, inputValue, image, toast, user, ticketId, textareaRef)
      }
    }
  }
}
