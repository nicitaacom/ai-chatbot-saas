"use server"

import { authenticator } from "otplib"

import { User } from "@/ts/namespaces/supabase"
import { decryptOTPSecret } from "@/(routes)/secret-key/utils/decryptOTPSecret"
import supabaseServerSupport from "@/libs/supabase/supabaseServerSupport"

export async function decryptOTPSecretThenVerityOTPAction(otp: string): Promise<boolean | string> {
  // TODO - implement custom logic for this - get user from jwt - not from supabase.auth.getUser() cuz auth logic is different
  const { data, error } = await supabaseServerSupport().auth.getUser()
  if (error) return error.message
  if (!data.user || !data.user?.id) return "It's no user or user.id"

  const user = data.user as User
  const encryptedOTPSecret = user.user_metadata.otpEncryptedSecret

  const decryptedOTPSecret = decryptOTPSecret(encryptedOTPSecret, user.id)
  if (typeof decryptedOTPSecret === "string") return decryptedOTPSecret
  // console.log(20, "decryptedOTPSecret - ", decryptedOTPSecret)
  // console.log(21, "otp - ", otp)
  // console.log(
  //   23,
  //   "ver - ",
  //   authenticator.verify({
  //     token: otp.replace(/\s/g, ""), // Remove any spaces
  //     secret: decryptedOTPSecret[0],
  //   }),
  // )

  return authenticator.verify({
    token: otp.replace(/\s/g, ""), // Remove any spaces
    secret: decryptedOTPSecret[0],
  })
}
