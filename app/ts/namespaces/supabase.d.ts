import { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"

export interface CustomUserMetadata {
  iss: string // Issuer
  sub: string // Subject ID
  name: string // User's full name (as on google)
  email: string // User's email
  picture: string // URL to the user's profile picture
  provider: string[] // Array of providers (e.g., Google)
  full_name: string // User's full name
  provider_id: string // Provider specific ID
  is_email_verified: boolean // Whether the email is verified
  is_phone_verified: boolean // Whether the phone number is verified
  avatar_url: string // URL for the user's avatar
  username: string // Username of the user (for support)
  isOTPEnabled: boolean // google authenticator
  otpEncryptedSecret: string
}

// Extend SupabaseUser
export interface User extends SupabaseUser {
  user_metadata: CustomUserMetadata
}

// This makes sure TypeScript treats this file as a module
export {}
