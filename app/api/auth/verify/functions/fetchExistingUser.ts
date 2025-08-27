import supabaseAdmin from "@/libs/supabaseAdmin"
import { IDBUser } from "@/ts/namespaces/supabase"

/**
 * // 5. fetchExistingUser
 * Fetch existing user by email.
 * Returns [IDBUser] if found and valid, otherwise string error.
 * @param email normalized email
 */
export async function fetchExistingUser(email: string): Promise<[IDBUser] | string> {
  try {
    const { data, error } = await supabaseAdmin.from("users").select("*").eq("email", email).single()

    // if DB error but not "row not found"
    if (error && error.code !== "PGRST116") return `auth.database.error_finding_user::${error.message}`

    // if no user found
    if (!data) return "auth.database.user_not_found"

    // ✅ validate required fields for IDBUser
    // encrypted password is required because user verify email which means signed in with credentials
    if (!data.id || !data.email || !data.encrypted_password) return "auth.database.invalid_user_record"

    return [data as IDBUser] // safe cast after validation
  } catch (err) {
    console.error("fetchExistingUser error:", err)
    return `auth.database.error_finding_user::${(err as any)?.message ?? "unknown"}`
  }
}
