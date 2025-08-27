"use client"

import { Input, Progress } from "antd"
import { useCallback, useMemo, useState, useEffect } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"

import { validatePasswordDetailed, PasswordValidationResult } from "@/features/auth/functions/validatePassword"
import useAuth from "@/features/auth/stores/useAuth"
import { useI18n } from "@/locales/client"
import { useDebounce } from "@/hooks/useDebounce"

export function InputPassword() {
  const t = useI18n()
  const { passwordInputValue, setPasswordInputValue, passwordInputError, setPasswordInputError, authMode } = useAuth()
  const [passwordStrength, setPasswordStrength] = useState<PasswordValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Debounce the password value with 1000ms delay
  const debouncedPassword = useDebounce(passwordInputValue, 1000)

  // Validate password when debounced value changes
  useEffect(() => {
    if (authMode === "login" || authMode === "recovery") return

    const validatePasswordStrength = async () => {
      if (!debouncedPassword.trim()) {
        setPasswordStrength(null)
        setIsValidating(false)
        return
      }

      setIsValidating(true)
      try {
        const validation = await validatePasswordDetailed(debouncedPassword, [], t)
        setPasswordStrength(validation)
      } catch (error) {
        console.error("Password validation error:", error)
        setPasswordStrength(null)
      } finally {
        setIsValidating(false)
      }
    }

    validatePasswordStrength()
  }, [debouncedPassword, t])

  // Real-time password input handling
  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setPasswordInputValue(value)

      // Clear previous password error immediately
      if (passwordInputError) {
        setPasswordInputError("")
      }

      // Show loading state when user is typing
      if (value.trim() && value !== debouncedPassword && authMode === "register") {
        setIsValidating(true)
      }
    },
    [passwordInputError, setPasswordInputValue, setPasswordInputError, debouncedPassword],
  )

  // Get progress bar color based on strength
  const getProgressColor = useMemo(() => {
    if (!passwordStrength) return "#d9d9d9"

    switch (passwordStrength.strength) {
      case "weak":
        return "#ff4d4f" // Red
      case "fair":
        return "#fa8c16" // Orange
      case "good":
        return "#fadb14" // Yellow
      case "strong":
        return "#52c41a" // Green
      default:
        return "#d9d9d9" // Gray
    }
  }, [passwordStrength])

  // Get strength text color
  const getStrengthTextColor = useMemo(() => {
    if (!passwordStrength) return "text-subTitle"

    switch (passwordStrength.strength) {
      case "weak":
        return "text-red-500"
      case "fair":
        return "text-orange-500"
      case "good":
        return "text-yellow-600"
      case "strong":
        return "text-green-500"
      default:
        return "text-subTitle"
    }
  }, [passwordStrength])

  return (
    <div>
      <Input.Password
        className="!bg-background !border-border-color/30 !text-title
    [&_.ant-input::placeholder]:!text-subTitle !rounded-lg hover:!border-brand/60 focus:!border-brand !shadow-none transition-all duration-200"
        size="large"
        iconRender={visible =>
          visible ? <AiOutlineEye className="text-subTitle" /> : <AiOutlineEyeInvisible className="text-subTitle" />
        }
        value={passwordInputValue}
        onChange={handlePasswordChange}
        placeholder={t("auth.password.placeholder")}
        status={passwordInputError ? "error" : ""}
      />

      {/* Password Error */}
      {passwordInputError && <div className="text-red-500 text-sm mt-1 px-1">{passwordInputError}</div>}

      {/* Password Strength Indicator */}
      {(passwordStrength || isValidating) && passwordInputValue && (
        <div className="mt-3 space-y-2">
          {/* Strength Label and Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-subTitle">{t("auth.password.strength")}:</span>
            {isValidating ? (
              <span className="text-sm text-subTitle">Checking...</span>
            ) : (
              passwordStrength && (
                <span className={`text-sm font-medium ${getStrengthTextColor} capitalize`}>
                  {passwordStrength.strength} ({passwordStrength.score}/100)
                </span>
              )
            )}
          </div>

          {/* Progress Bar */}
          {passwordStrength && (
            <Progress
              percent={passwordStrength.score}
              strokeColor={getProgressColor}
              trailColor="#f0f0f0"
              showInfo={false}
              size="small"
              className="[&_.ant-progress-bg]:transition-all [&_.ant-progress-bg]:duration-300"
            />
          )}

          {/* Validation Errors/Tips */}
          {passwordStrength && passwordStrength.errors.length > 0 && (
            <div className="space-y-1">
              {passwordStrength.errors.slice(0, 3).map((error, index) => (
                <div key={index} className="flex items-start text-xs text-subTitle">
                  <span className="text-orange-500 mr-2 mt-0.5 flex-shrink-0">•</span>
                  <span>{error}</span>
                </div>
              ))}
              {passwordStrength.errors.length > 3 && (
                <div className="text-xs text-subTitle/70 pl-4">+{passwordStrength.errors.length - 3} more requirements...</div>
              )}
            </div>
          )}

          {/* Success message for strong passwords */}
          {passwordStrength && passwordStrength.strength === "strong" && passwordStrength.errors.length === 0 && (
            <div className="flex items-center text-xs text-green-600">
              <span className="mr-2">✓</span>
              <span>{t("auth.password.strength.strong")}</span>
            </div>
          )}

          {/* Loading indicator */}
          {isValidating && (
            <div className="flex items-center text-xs text-subTitle">
              <div className="animate-spin mr-2 h-3 w-3 border border-brand border-t-transparent rounded-full"></div>
              <span>{t("auth.login.validating_password_security")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
