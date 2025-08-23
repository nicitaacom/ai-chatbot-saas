"use client"

import { toNumber } from "lodash"
import { User } from "@/ts/namespaces/supabase"
import { TicketsDropdown } from "../TicketsDropdown/TicketsDropdown"
import { ISupportTicketDB } from "@/features/auth/sub/support/interfaces/ISupportTicketDB"
import { Support } from "@/features/auth/sub/support/classes/Support"

export function SelectOrCreateTicket({ user, ticketsResp }: { user: User; ticketsResp: ISupportTicketDB[] }) {
  const supportSDK = new Support(user.id)
  const tickets = supportSDK.getTicketsLimits()

  return (
    <section
      className="w-[300px] mobile:w-[350px] tablet:w-[350px] laptop:w-[450px] flex flex-col gap-y-4 
    [@media_(min-height:1024px)]:pb-64 ">
      {ticketsResp.length === 0 ? (
        <h1 className="text-2xl">You have no tickets - create one?</h1>
      ) : (
        <div className="flex flex-col gap-y-4">
          <h1 className="text-2xl mt-1 border-b">{ticketsResp.length === 3 ? "Select ticket" : "Createor select ticket"}</h1>
          <TicketsDropdown
            parentClassName="w-full bg-background/50"
            className=" border border-t-0 border-x-0"
            tickets_response={ticketsResp}
            userId={user.id}
            isShowMarkTicketAsCompletedButton={true}
          />
        </div>
      )}

      {ticketsResp.length < 3 && <CreateTicketForm user={user as User} />}

      {ticketsResp.length >= toNumber(process.env.) && (
        <p className="text-warning bg-warning/30 rounded p-1">
          You reached max amount of concurrently opened tickets. Mark some ticket as completed to open a new one.
        </p>
      )}
    </section>
  )
}
