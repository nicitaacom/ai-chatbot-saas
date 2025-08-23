"use client"

import Link from "next/link"
import { useState } from "react"
import { twMerge } from "tailwind-merge"

import { MarkTicketAsCompletedUser } from "@/components/support/MarkTicketAsCompletedUser"
import { useTickets } from "@/store/support/useTickets"
import { ITicketDB } from "@/features/auth/sub/support/interfaces/ISupportTicketDB"

export function TicketsDropdownContent({
  isShowDropdown,
  userId,
  isShowMarkTicketAsCompletedButton,
}: {
  isShowDropdown: boolean
  userId: string
  isShowMarkTicketAsCompletedButton: boolean
}) {
  const [hover, setHover] = useState<ITicketDB | null>(null)
  const { tickets, setSelectedTicket } = useTickets()
  const isHover = hover !== null

  function mouseHover(index: ITicketDB) {
    return () => setHover(index)
  }

  function selectTicket(index: ITicketDB) {
    return () => setSelectedTicket(index)
  }

  return (
    <div
      className={twMerge(
        "absolute w-full bg-primary top-[100%] left-0 border border-t-0 rounded-b",
        isShowDropdown
          ? "opacity-100 visible translate-y-[0px] transition-all duration-300"
          : "opacity-0 invisible translate-y-[-20px] transition-all duration-300",
      )}
      onMouseLeave={() => setHover(null)}>
      <div className="max-h-[200px] overflow-y-auto bg-foreground">
        {tickets.map((ticket, index) => (
          <Link
            className={twMerge(
              "hover:bg-hover-color duration-150 text-center px-2",
              "flex flex-row gap-x-2 justify-center items-center border-b bg-foreground text-title last:rounded-b",
              index === 0 && "border-t",
              // if hover on border set border green (its some UI issue - just keep it as is)
              isHover ? hover === ticket && "bg-brand/30" : userId === ticket.id && "bg-brand text-background",
            )}
            href={`/support/${userId}/${ticket.id}`}
            onClick={selectTicket(ticket)}
            onMouseOver={mouseHover(ticket)}
            key={ticket.id}>
            <div className="w-full flex justify-between items-center py-2">
              {ticket.subject}
              {isShowMarkTicketAsCompletedButton && (
                <MarkTicketAsCompletedUser userId={userId} isAllowToCloseTicket={isShowMarkTicketAsCompletedButton} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
