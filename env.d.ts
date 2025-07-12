declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PUSHER_APP_ID: string
      NEXT_PUBLIC_PUSHER_APP_KEY: string
      PUSHER_SECRET: string
    }
  }
}

export {}
