import { decryptOTPSecretThenVerityOTPAction } from "./actions/decryptOTPSecretAction"

export class OTPSDK {
  async verifyOTP(otp: string): Promise<string | boolean> {
    if (otp.length !== 6) return "Seems like you entered something else but not OTP (length of OTP should be 6)"

    const decryptedOTPSecret = await decryptOTPSecretThenVerityOTPAction(otp)
    if (typeof decryptedOTPSecret === "string") return decryptedOTPSecret

    if (decryptedOTPSecret === false) return "OTP code is invalid"

    return decryptedOTPSecret
  }
}
