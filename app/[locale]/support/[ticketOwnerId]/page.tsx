import { redirect } from "next/navigation"

import { User } from "@/ts/namespaces/supabase"
import { SelectOrCreateTicket } from "./components/SelectOrCreateTicket/SelectOrCreateTicket"
import supabaseServer from "@/libs/supabaseServer"
import { ISupportTicketDB } from "@/features/auth/sub/support/interfaces/ISupportTicketDB"

// don't do ISR because I use supabaseServerSupport() in layout to prefetch user (it uses cookies)
// also I use cookies on /support

export default async function SupportPage() {
  // const { data } = await supabaseServer().auth.getUser()
  // if (!data?.user?.id) redirect("/auth") // redirect not authenticated user to /
  // const { data: tickets, error } = await supabaseServer().from("tickets").select().eq("is_open", true)
  // if (error) {
  //   console.log(14, `error selecting open tickets - ${error.message}`)
  //   return <>Error selecting open tickets - {error.message}</>
  // }
  // const { data: subscription, error } = await supa
  // return (
  //   <main className="relative h-full bg-foreground flex flex-col justify-center items-center">
  //     <SelectOrCreateTicket user={data.user as User} ticketsResp={tickets as ISupportTicketDB[]} />
  //   </main>
  // )
}
