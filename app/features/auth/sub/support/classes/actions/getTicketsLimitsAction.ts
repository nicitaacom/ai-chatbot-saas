"use server"

import { TPlanName } from "@/ts/types/TPlanName"
import { OPEN_TICKETS_LIMITS } from "../../consts/openTicketLimits"

export async function getTicketsLimitsAction(planName: string): Promise<number> {
  return OPEN_TICKETS_LIMITS[planName as TPlanName]
}
