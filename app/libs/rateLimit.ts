type Window =
  | `${number}s`
  | `${number} s`
  | `${number}m`
  | `${number} m`
  | `${number}h`
  | `${number} h`
  | `${number}d`
  | `${number} d`

type TEndpoints = "rateLimit/limit" | "rateLimit/remaining" | "rateLimit/reset"

class Limiter {
  private baseUrl =
    process.env.NODE_ENV === "development" ? "http://localhost:3000/" : process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL
  private limitNumber: number
  private window: Window
  private key: string
  private forwardedFor = process.env.NEXT_PUBLIC_PRODUCTION_URL

  constructor(limit: number, window: Window, key: string) {
    // Pass the raw window string directly to slidingWindow
    this.limitNumber = limit
    this.window = window
    this.key = key // key passed into Limiter is this.key - so I can use it in private methods
  }

  private async fetchRequest(endpoint: TEndpoints, body: object): Promise<{ ok: boolean; data: any }> {
    const res = await fetch(`${this.baseUrl}api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": this.forwardedFor,
      },
      body: JSON.stringify(body),
      cache: "no-cache",
    })
    const data = await res.json()
    return { ok: res.ok, data }
  }

  private buildKey(session?: string) {
    return session ? `${this.key}-${session}` : this.key // otherwise key passed to Limiter contructor
  }

  // increment + return remaining
  async limit(isLimitByIp: boolean, key?: string) {
    const { ok, data } = await this.fetchRequest("rateLimit/limit", {
      key: this.buildKey(key),
      nActions: this.limitNumber,
      window: this.window,
      isLimitByIp,
    } as API.RateLimitRequest)
    if (!ok) return data.error as string

    return { remaining: data.remaining, reset: data.reset } as API.RateLimitResponse
  }

  /**
   *
   * @param isLimitByIp if you use rate limit by ip (to limit this)
   * @param session - optional - might be userId
   */
  async remaining(isLimitByIp: boolean, key?: string) {
    const { ok, data } = await this.fetchRequest("rateLimit/remaining", {
      key: this.buildKey(key),
      isLimitByIp,
    } as API.RateLimitRequest)
    if (!ok) return data.error as string

    return { remaining: data.remaining, reset: data.reset } as API.RateLimitResponse
  }

  async reset(isLimitByIp: boolean, key?: string) {
    const { ok, data } = await this.fetchRequest("rateLimit/reset", {
      key: this.buildKey(key),
      isLimitByIp,
    } as API.RateLimitRequest)
    if (!ok) return data.error as string
  }
}

/**
 * Created for client side usage
 * It sends a request to API endpoint to limit or get remaining
 */
class RateLimit {
  public messageNew: Limiter
  public ticketNew: Limiter
  public credentials: Limiter

  constructor() {
    this.messageNew = new Limiter(50, "50 m", "message:new") // 50 messages / 50 mins
    this.ticketNew = new Limiter(5, "5 m", "ticket:new") // 5 attempts / 5 mins
    this.credentials = new Limiter(10, "1 h", "credentials") // 10 attempts / 1 hour
  }
}

export const rateLimit = new RateLimit()
