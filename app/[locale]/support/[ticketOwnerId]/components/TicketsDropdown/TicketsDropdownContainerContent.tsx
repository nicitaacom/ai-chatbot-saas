import { usePathname } from "next/navigation"
import { BiSolidDownArrow } from "react-icons/bi"

import { useTickets } from "@/store/support/useTickets"

export function TicketsDropdownContainerContent() {
  const { selectedTicket, tickets } = useTickets()
  const path = usePathname()

  return (
    <div className="w-full flex flex-row gap-x-2 justify-center items-center p-1 pl-0">
      {tickets?.length === 1 ? (
        <p className="w-full truncate text-title">{tickets[0].subject}</p>
      ) : (
        <div className="w-full flex flex-row gap-x-2 justify-between items-center">
          <h2 className="truncate">{selectedTicket?.subject ? selectedTicket?.subject : tickets[0]?.subject}</h2>
          <div className="w-[16px] h-[16px]">
            <BiSolidDownArrow className=" text-icon-color" />
          </div>
        </div>
      )}
    </div>
  )
}
