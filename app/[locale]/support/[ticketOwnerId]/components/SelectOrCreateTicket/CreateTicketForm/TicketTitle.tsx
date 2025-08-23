"use client"

import { Input } from "antd"
import { useState } from "react"
import { FiEdit3 } from "react-icons/fi"

interface TicketTitleProps {
  ticketTitle: string
  setTicketTitle: React.Dispatch<React.SetStateAction<string>>
}

export function TicketTitle({ ticketTitle, setTicketTitle }: TicketTitleProps) {
  const [isFocused, setIsFocused] = useState(false)
  const isValid = ticketTitle.length >= 4
  const isWarning = ticketTitle.length > 0 && ticketTitle.length <= 3

  const validationClasses = isValid
    ? "ring-success/30 shadow-success/10 border-success/20"
    : isWarning
      ? "ring-warning/30 shadow-warning/10 border-warning/20"
      : "border-border-color/20"

  const ringClasses = isFocused
    ? `ring-2 ${isValid ? "ring-success/40" : isWarning ? "ring-warning/40" : "ring-brand/40"}`
    : isValid
      ? "ring-1 ring-success/30"
      : isWarning
        ? "ring-1 ring-warning/30"
        : ""

  const accentColor = isValid ? "bg-success" : isWarning ? "bg-warning" : "bg-brand"
  const iconColor = isFocused
    ? "text-brand scale-110"
    : isValid
      ? "text-success"
      : isWarning
        ? "text-warning"
        : "text-icon-color/50"

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-title/90 tracking-wide">Ticket Title</label>

      <div className={`relative group transition-all duration-200 ease-out ${isFocused ? "scale-[0.99]" : "scale-100"}`}>
        <div
          className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm rounded-lg border shadow-sm duration-150
          ease-out ${validationClasses} ${ringClasses}`}
        />

        <div className="relative">
          <Input
            value={ticketTitle}
            onChange={e => setTicketTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="[BUG]: Creating account issue"
            className="h-12 bg-transparent border-none outline-none text-title placeholder:text-subTitle/70 px-4 rounded-lg font-primary text-[15px] leading-relaxed transition-all duration-200"
            style={{ boxShadow: "none" }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <FiEdit3 className={`w-4 h-4 transition-all duration-200 ${iconColor}`} />
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300
             ease-out ${isFocused ? "w-full opacity-100" : "w-0 opacity-0"} ${accentColor}`}
        />
      </div>
    </div>
  )
}
