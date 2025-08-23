"use client"

import { twMerge } from "tailwind-merge"

import { useSupportMessages } from "@/features/auth/sub/support/stores/useSupportMessages"
import { handlePasteImageFn } from "@/features/auth/sub/support/functions/handlePasteImageFn"
import { useChangeHeight } from "./hook/useChangeHeight"

interface TicketDescriptionProps {
  isVerified: boolean
  turnstileRef: React.RefObject<HTMLDivElement | null>
}
export function TicketDescription({ isVerified, turnstileRef }: TicketDescriptionProps) {
  const { messageBody, setMessageBody, setImage } = useSupportMessages()

  const { height } = useChangeHeight(messageBody)

  return (
    <div className="flex flex-col">
      {!isVerified ? (
        <div ref={turnstileRef} className="h-[68px] cf-turnstile"></div>
      ) : (
        <>
          <label>Describe issue</label>
          {/* For DRY and allow paste image in initial ticket message */}
          <textarea
            style={{
              overflowY: "auto",
              height: `${height}px`, // Use state to manage dynamic height
            }}
            className={twMerge(
              `w-[calc(100%-2px)] min-h-[44px] !max-h-[184px] resize-none bg-background px-4 py-2 outline-none text-title hide-scrollbar`,
              "border-b px-2 rounded-t",
            )}
            onChange={e => setMessageBody(e.target.value)}
            value={messageBody}
            onPaste={e => handlePasteImageFn(e, setImage)}
            placeholder="I clicked the button and..."
            autoFocus></textarea>
        </>
      )}
    </div>
  )
}
