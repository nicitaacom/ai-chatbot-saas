"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { User } from "@/ts/namespaces/supabase"
import { useVerifyHuman } from "@/features/turnstile/hook/useVerifyHuman"
import { createTicketFn } from "@/features/auth/sub/support/functions/createTicketFn"
import { TicketDescription } from "./TicketDescription/TicketDescription"
import { TicketTitle } from "./TicketTitle"
import { CreateTicketButton } from "./CreateTicketButton"

export function CreateTicketForm({ user }: { user: User }) {
  const router = useRouter()
  const [ticketTitle, setTicketTitle] = useState("")
  const turnstileRef = useRef<HTMLDivElement>(null)
  const { isVerified } = useVerifyHuman(turnstileRef)

  return (
    <form
      className="flex flex-col gap-y-4"
      onSubmit={e => {
        e.preventDefault()
        createTicketFn(isVerified, user, ticketTitle, router)
      }}>
      <TicketTitle ticketTitle={ticketTitle} setTicketTitle={setTicketTitle} />
      <TicketDescription isVerified={isVerified} turnstileRef={turnstileRef} />
      <CreateTicketButton isVerified={isVerified} ticketTitle={ticketTitle} />
    </form>
  )
}
