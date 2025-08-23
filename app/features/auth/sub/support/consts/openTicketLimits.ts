import { TPlanName } from "@/ts/types/TPlanName"

// Define a type for plan limits
export type PlanLimits = {
  [key in TPlanName]: number
}
// Environment variables for limits
export const OPEN_TICKETS_LIMITS: PlanLimits = {
  Free: Number(process.env.OPEN_TICKETS_FREE),
  Basic: Number(process.env.OPEN_TICKETS_BASIC),
  Pro: Number(process.env.OPEN_TICKETS_PRO),
}
