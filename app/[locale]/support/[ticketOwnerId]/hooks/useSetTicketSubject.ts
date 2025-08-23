import { useSearchParams } from "next/navigation"
import { Dispatch, SetStateAction, useEffect } from "react"

export const useSetTicketSubject = (
  setTicketSubject: Dispatch<SetStateAction<string>>,
  setMessageBody: (msg: string) => void,
) => {
  const ticket_subject = useSearchParams().get("ticket_subject")
  const ticket_body = useSearchParams().get("ticket_body")

  useEffect(() => {
    if (ticket_subject) setTicketSubject(ticket_subject)
    if (ticket_body) setMessageBody(ticket_body)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
