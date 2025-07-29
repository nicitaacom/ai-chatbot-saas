declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRODUCTION_URL: string

      PUSHER_APP_ID: string
      NEXT_PUBLIC_PUSHER_APP_KEY: string
      PUSHER_SECRET: string
    }
  }
}

export {}
