"use client"

import { useCallback, useEffect } from "react"
import { Input } from "antd"

import { useI18n } from "@/locales/client"
import useAuth from "@/features/auth/stores/useAuth"
import { Auth } from "@/features/auth/class/Auth"
import { useDebounce } from "@/hooks/useDebounce"

export function InputEmail() {
  const t = useI18n()
  const { emailInputValue, setEmailInputValue, emailInputError, setEmailInputError } = useAuth()

  const authSDK = new Auth()

  // Debounce the email input value with 1000ms delay
  const debouncedEmailValue = useDebounce(emailInputValue, 1000)

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setEmailInputValue(newValue)

      // Clear error immediately when user starts typing (for better UX)
      if (emailInputError) {
        setEmailInputError("")
      }
    },
    [emailInputError, setEmailInputValue, setEmailInputError],
  )

  // Validate email when debounced value changes
  useEffect(() => {
    // Only validate if there's a value, it's not empty, and contains '@' symbol
    if (debouncedEmailValue && debouncedEmailValue.trim() !== "" && debouncedEmailValue.includes("@")) {
      const validationResult = authSDK.validateEmail(debouncedEmailValue, t)

      if (typeof validationResult === "string") {
        setEmailInputError(validationResult)
      } else {
        // Clear error if validation passes
        setEmailInputError("")
      }
    }
  }, [debouncedEmailValue])

  return (
    <div>
      <Input
        className="!bg-background !border-border-color/30 !text-title placeholder:!text-subTitle
     !rounded-lg hover:!border-brand/60 focus:!border-brand !shadow-none transition-all duration-200"
        type="email"
        size="large"
        value={emailInputValue}
        onChange={handleEmailChange}
        placeholder={t("auth.email.placeholder")}
        status={emailInputError ? "error" : ""}
      />
      {emailInputError && <div className="text-red-500 text-sm mt-1 px-1">{emailInputError}</div>}
    </div>
  )
}
