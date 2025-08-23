declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRODUCTION_URL: string
      NEXT_PUBLIC_SITE_URL: string

      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string

      PUSHER_APP_ID: string
      NEXT_PUBLIC_PUSHER_APP_KEY: string
      PUSHER_SECRET: string

      NEXT_PUBLIC_CLOUDFLARE_SITE_KEY: string
      CLOUDFLARE_SECRET_KEY: string

      JWT_SECRET: string
      PASSWORD_SECRET: string

      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: string
      STRIPE_WEBHOOK_SECRET_TEST: string
      STRIPE_WEBHOOK_SECRET_LIVE: string
      STRIPE_SECRET_KEY_TEST: string
      STRIPE_SECRET_KEY_LIVE: string

      RESEND_SECRET: string

      NEXT_PUBLIC_SUPPORT_EMAIL: string

      ZEROBOUNCE_API_KEY: string

      TELEGRAM_BOT_TOKEN: string
      TELEGRAM_CHAT_ID: string

      OPEN_TICKETS_FREE: string
      OPEN_TICKETS_BASIC: string
      OPEN_TICKETS_PRO: string
    }
  }
}

export {}
