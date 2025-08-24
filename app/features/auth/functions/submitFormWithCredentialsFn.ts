import { TI18nFunction } from "@/ts/types/TI18nHook"
import { Auth } from "../class/Auth"
import { useLoading } from "@/stores/useLoading"
import useAuth from "../stores/useAuth"
import useNotification from "@/stores/useError"
import { rateLimit } from "@/libs/rateLimit"

/**
 *
 * @param e - form event
 * @param t - i18n (const t = useI18n())
 * This function login/register user with credentials based on authMode
 */
export async function submitFormWithCredentialsFn(e: React.FormEvent, t: TI18nFunction): Promise<void | string> {
  const { setIsLoading } = useLoading.getState()
  const { setEmailInputError, setPasswordInputError } = useAuth.getState()
  const { emailInputValue, passwordInputValue, authMode } = useAuth.getState()
  const { setNotification } = useNotification.getState()

  const authSDK = new Auth()

  try {
    setIsLoading(true)
    e.preventDefault()
    // 0. Validate inputs
    const emailValidation = authSDK.validateEmail(emailInputValue, t)
    if (typeof emailValidation === "string") {
      setEmailInputError(emailValidation)
      throw Error(emailValidation)
    }

    const emailVerification = await authSDK.verifyEmails([emailInputValue])
    if (typeof emailVerification === "string") throw Error(emailVerification)
    else if (emailVerification.length > 0) throw Error("This email is invalid (not deliverable)")

    const passwordValidation = await authSDK.validatepassword(passwordInputValue, [emailInputValue.split("@")[0]], t)
    if (typeof passwordValidation === "string") {
      setPasswordInputError(passwordValidation)
      throw Error(passwordValidation)
    }
  } catch (error) {
    console.log(42, "error", error)
    return // to don't execute second try-catch block
  } finally {
    setIsLoading(false)
  }

  // second try catch is required to don't duplicate errors for email and password with global error
  try {
    setIsLoading(true)
    // Clear previous errors
    setEmailInputError("")
    setPasswordInputError("")

    // 1. Check rate limit
    const rateLimitResp = await rateLimit.credentials.remaining(true)
    if (typeof rateLimitResp === "string") throw Error(rateLimitResp)
    if (rateLimitResp.remaining === 0) throw Error("You reached max amount of attempts. Try again later")

    if (authMode === "login") {
      const loginWithCredentialsResp = await authSDK.loginWithCredentials(emailInputValue, passwordInputValue)
      if (typeof loginWithCredentialsResp === "string") throw Error(loginWithCredentialsResp)
    }
    if (authMode === "register") {
      const loginWithCredentialsResp = await authSDK.registerWithCredentials(emailInputValue, passwordInputValue)
      if (typeof loginWithCredentialsResp === "string") throw Error(loginWithCredentialsResp)
      else setNotification("success", loginWithCredentialsResp[0])
    }
  } catch (error) {
    console.log(58, "error in handleSubmit", error)
    if (error instanceof Error && !error.message.includes("Account created successfully")) setNotification("error", error.message)
  } finally {
    setIsLoading(false)
  }
}
