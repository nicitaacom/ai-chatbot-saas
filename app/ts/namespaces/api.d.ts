declare namespace API {
  // /api/rateLimit
  type RateLimitRequest = {
    key: string
    nActions: number
    window: `${number}${string}`
    isLimitByIp: boolean
  }

  type RateLimitResponse = {
    remaining: number
    reset: number
  }
}
