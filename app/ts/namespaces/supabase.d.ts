import { Session as SupabaseSession } from "@supabase/auth-helpers-nextjs"

export interface IDBUser {
  id: string
  created_at: string // ISO string (timestamptz)
  username: string
  email: string
  avatar_url?: string | null
  roles: string[]
  email_verified_at?: string | null // ISO string (timestamptz)
  phone_verified_at?: string | null // ISO string (timestamptz)
  providers: string[]
  encrypted_password: string
  phone?: string | null
  is_otp_enabled: boolean // google authenticator
  otp_encrypted_secret?: string | null
}

// Extend SupabaseUser
export interface User {
  user: IDBUser
  session: SupabaseSession
}

// This makes sure TypeScript treats this file as a module
export {}
