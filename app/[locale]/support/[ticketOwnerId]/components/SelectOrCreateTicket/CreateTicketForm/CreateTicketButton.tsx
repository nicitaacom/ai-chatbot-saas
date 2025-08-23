"use client"

import { useState } from "react"
import { twMerge } from "tailwind-merge"
import { IoAdd } from "react-icons/io5"
import { RiCommandLine } from "react-icons/ri"

import { LoadingSpinner } from "@/components/LoadingSpinner"
import { useSupportMessages } from "@/features/auth/sub/support/stores/useSupportMessages"
import { useLoading } from "@/stores/useLoading"

export function CreateTicketButton({ ticketTitle, isVerified }: { ticketTitle: string; isVerified: boolean }) {
  const { messageBody } = useSupportMessages()
  const { isLoading } = useLoading()
  const [isPressed, setIsPressed] = useState(false)

  const isDisabled = isLoading || ticketTitle.length < 3 || messageBody.length < 5
  const canCreate = !isDisabled && isVerified

  return (
    <button
      disabled={isDisabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={twMerge(
        "relative w-full h-12 rounded-lg overflow-hidden transition-all duration-200 ease-out group",
        "bg-foreground/40 backdrop-blur-sm border border-border-color/20 shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-brand/40",
        isPressed ? "scale-[0.98]" : "scale-100",
        canCreate && "bg-success/20 border-success/30 shadow-success/10",
        isDisabled && "opacity-60 cursor-not-allowed",
        !isVerified && "opacity-50",
      )}>
      <div className="flex items-center justify-between px-6 h-full relative z-10">
        <div className="flex items-center gap-3">
          {isLoading ? (
            <>
              <span className="text-title font-medium">Creating ticket</span>
              <LoadingSpinner />
            </>
          ) : (
            <>
              <IoAdd className={`w-5 h-5 ${canCreate ? "text-success" : "text-icon-color/70"}`} />
              <span className={`font-medium ${canCreate ? "text-title" : "text-subTitle"}`}>Create Ticket</span>
            </>
          )}
        </div>

        {!isLoading && (
          <div className="flex items-center gap-1 px-2 py-1 bg-info/20 rounded border border-info/30">
            <RiCommandLine className="w-3 h-3 text-info" />
            <span className="text-xs font-mono text-info font-medium">ctrl+enter</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {canCreate && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-success" />}
    </button>
  )
}
