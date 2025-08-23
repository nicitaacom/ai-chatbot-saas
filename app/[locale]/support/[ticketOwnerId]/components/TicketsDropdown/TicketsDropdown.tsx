"use client"

import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

import { useSetInitialTickets } from "@/hooks/support/setInitialTickets"
import { useSetSelectedTicket } from "@/hooks/support/useSetSelectedTicket"
import useOnEscOrClickOutside from "@/hooks/useOnEscOrClickOutside"
import { useTickets } from "@/store/support/useTickets"
import { ITicketDB } from "@/features/auth/sub/support/interfaces/ISupportTicketDB"
import { TicketsDropdownContainerContent } from "./TicketsDropdownContainerContent"
import { TicketsDropdownContent } from "./TicketsDropdownContent"

interface TicketsDropdownProps {
  tickets_response: ITicketDB[]
  parentClassName?: string
  className?: string
  userId: string
  isShowMarkTicketAsCompletedButton: boolean
}

export function TicketsDropdown({
  tickets_response,
  userId,
  className,
  parentClassName,
  isShowMarkTicketAsCompletedButton,
}: TicketsDropdownProps) {
  const dropdownContainerRef = useRef<HTMLDivElement>(null)
  const [isShowDropdown, setIsShowDropdown] = useState(false)
  const path = usePathname()

  const { tickets } = useTickets()

  function closeDropdown() {
    setIsShowDropdown(false)
  }
  function toggleDropdown() {
    setIsShowDropdown(!isShowDropdown)
  }

  useSetInitialTickets(tickets_response)

  // it's a best practice to add condition to close dropdown only if it's opened (working only 1 dropdown issue)
  useOnEscOrClickOutside(dropdownContainerRef, closeDropdown, isShowDropdown)

  // to set selected ticket to don't go to some path when clicked on ticket in TicketsDropdownContent
  useSetSelectedTicket(tickets_response)

  return (
    <div
      className={twMerge(
        "w-fit max-w-[calc(100vw-32px)] flex flex-row gap-x-2 justify-end desktop:justify-center items-center px-0 duration-300 z-[139]",
        parentClassName,
      )}>
      <div
        className={twMerge(
          `relative w-full flex justify-between items-center gap-x-2 border border-border-color border-b-0 rounded-t
           px-2 mt-1 z-[111]`,
          (tickets.length > 1 || !path.includes(tickets[0]?.id)) && "cursor-pointer",
          className,
        )}
        onClick={toggleDropdown}
        ref={dropdownContainerRef}>
        <TicketsDropdownContainerContent />
        {(tickets?.length > 1 || isShowMarkTicketAsCompletedButton) && (
          <TicketsDropdownContent
            isShowDropdown={isShowDropdown}
            userId={userId}
            isShowMarkTicketAsCompletedButton={isShowMarkTicketAsCompletedButton}
          />
        )}
      </div>
    </div>
  )
}
