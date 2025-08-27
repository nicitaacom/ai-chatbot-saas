import argon2 from "argon2"
import { nanoid } from "nanoid"

import { IDBUser } from "@/ts/namespaces/supabase"
import supabaseAdmin from "@/libs/supabaseAdmin"
import { funnyUsernames } from "@/features/auth/consts/funnyUsernames"

/**
 * // 6. insertInUsersFn
 * Create or update a user row with argon2+pepper.
 * @param email normalized email
 * @param password plaintext password
 * @param existingUser existing IDBUser or null
 * @returns [IDBUser] on success or string error
 */
export async function insertInUsers(email: string, password: string, existingUser: IDBUser | null): Promise<[IDBUser] | string> {
  const pepper = process.env.PASSWORD_SECRET
  if (!pepper) return "auth.server.missing_password_secret"
  try {
    const encrypted_password = await argon2.hash(`${pepper}:${password}`, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    })
    if (existingUser) {
      const updated: Partial<IDBUser> = {
        encrypted_password,
        providers: Array.from(new Set([...(existingUser.providers ?? []), "credentials"])),
        email_verified_at: new Date().toISOString(),
      }
      const { data: updatedRow, error } = await supabaseAdmin
        .from("users")
        .update(updated)
        .eq("id", existingUser.id)
        .select()
        .single()
      if (error) return `auth.database.error::${error.message}`
      return [updatedRow as IDBUser]
    } else {
      const username = funnyUsernames[Math.floor(Math.random() * funnyUsernames.length)]

      const newRow: IDBUser = {
        id: nanoid(32),
        email,
        encrypted_password,
        providers: ["credentials"],
        email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        roles: ["USER"],
        username,
        is_otp_enabled: false,
      }
      const { data: inserted, error } = await supabaseAdmin.from("users").insert([newRow]).select().single()
      if (error) return `auth.database.error::${error.message}`
      return [inserted as IDBUser]
    }
  } catch (err) {
    console.error("insertInUsersFn error:", err)
    return `auth.database.error::${(err as any)?.message ?? "user_create_failed"}`
  }
}
