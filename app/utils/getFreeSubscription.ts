import moment from "moment-timezone"
import { TPlanName } from "@/ts/types/TPlanName"
import { Subscription } from "@/ts/types_db_stripe"

export const FREE_PLAN_PRICE_ID =
  // TODO - urgent update this price from mock data to actuall data
  process.env.NODE_ENV === "development" ? "price_1QmcfgAk7lHlbdMeFjqJe8jj" : "price_1QmcieAk7lHlbdMe9ehLrJqQ"

export function getFreeSubscription(userId: string): Subscription {
  return {
    id: `sub_${userId}`,
    user_id: userId,
    metadata: {
      features: '["3 open tickets", "5 email accounts", "2 request lengths"]',
      unit_amount: "0",
      isRecurrent: "true",
      isAnnually: "false",
    },
    status: "active",
    price_id: FREE_PLAN_PRICE_ID,
    name: "Free" as TPlanName,
    quantity: 1,
    cancel_at_period_end: undefined,
    cancel_at: undefined,
    canceled_at: undefined,
    current_period_start: moment.now().toString(),
    current_period_end: moment.now().toString(),
    created: moment.now().toString(),
    ended_at: undefined,
    trial_start: undefined,
    trial_end: undefined,
  }
}
