import { isArray } from "lodash"

import { User } from "@/ts/namespaces/supabase"
import { loginWithCredentialsAction } from "./actions/loginWithCredentialsAction"
import { registerWithCredentialsAction } from "./actions/registerWithCredentialsAction"
import { recoverCredentialsAction } from "./actions/recoverCredentialsAction"
import { validateEmail } from "../functions/validateEmail"
import { TI18nFunction } from "@/ts/types/TI18nHook"
import { TLocaleTag } from "@/ts/types/TLocaleTag"
import { validatePassword } from "../functions/validatePassword"
import { verifyEmailsAction } from "./actions/verifyEmailsAction"

export class Auth {
  // Note: jwt is more secure then accessing all time with userId because if hacker use IP spoofing and random userId
  // then state in js can be changed (to random userId) and data acessed if userId match in DB

  async loginWithCredentials(email: string, password: string, isRememberMe: boolean): Promise<User | string> {
    const loginWithCredentialsResp = await loginWithCredentialsAction(email, password, isRememberMe)
    return loginWithCredentialsResp
  }
  async registerWithCredentials(email: string, password: string): Promise<[string] | string> {
    const registerWithCredentialsResp = await registerWithCredentialsAction(email, password)
    return registerWithCredentialsResp
  }
  async recoverCredentials(email: string): Promise<string | boolean> {
    const registerWithCredentialsResp = await recoverCredentialsAction(email)
    if (isArray(registerWithCredentialsResp)) return registerWithCredentialsResp[0]
    else return registerWithCredentialsResp
  }

  validateEmail(emailInputValue: string, i18n: TI18nFunction | TLocaleTag) {
    const emailValidation = validateEmail(emailInputValue, i18n)
    return emailValidation
  }
  async verifyEmails(emailInputValues: string[]) {
    const emailValidation = await verifyEmailsAction(emailInputValues)
    return emailValidation
  }
  async validatepassword(passwordInputValue: string, userInputs: string[], i18n: TI18nFunction | TLocaleTag) {
    const passwordValidation = await validatePassword(passwordInputValue, userInputs, i18n)
    return passwordValidation
  }
}
