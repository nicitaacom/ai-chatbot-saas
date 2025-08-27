"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/locales/client"
import { MdOutlineErrorOutline, MdOutlineInfo, MdOutlineWarning, MdOutlineCheckCircle } from "react-icons/md"
import { BiRefresh } from "react-icons/bi"
import useNotification from "@/stores/useError"
import useAuth from "@/features/auth/stores/useAuth"
import { twMerge } from "tailwind-merge"
import { Auth } from "@/features/auth/class/Auth"
import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export function AuthHeader() {
  const t = useI18n()
  const { notification, setNotification, status } = useNotification()

  const { authMode, emailInputValue, passwordInputValue } = useAuth()
  const [resendState, setResendState] = useState<"idle" | "loading" | "sent" | "error">("idle")
  const [resendError, setResendError] = useState<string>("")

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const authSDK = new Auth()

  // 1. Map status to notification styles (60-30-10 rule applied)
  const statusConfig = {
    error: {
      bg: "bg-danger/10",
      text: "text-danger",
      border: "border-danger/20",
      icon: MdOutlineErrorOutline,
    },
    info: {
      bg: "bg-info/10",
      text: "text-info",
      border: "border-info/20",
      icon: MdOutlineInfo,
    },
    warning: {
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/20",
      icon: MdOutlineWarning,
    },
    success: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
      icon: MdOutlineCheckCircle,
    },
  } as const

  const handleResend = async () => {
    // 2. Early return if already loading
    if (resendState === "loading") return

    try {
      setResendState("loading")
      // TODO: Remove mock error
      await authSDK.registerWithCredentials(emailInputValue, passwordInputValue)
      setResendState("sent")
      // 3. Reset state after 3 seconds
      setTimeout(() => setResendState("idle"), 3000)
    } catch (error) {
      console.error("Failed to resend email:", error)
      setResendError(error instanceof Error ? error.message : "Unknown error")
      setResendState("error")
      // 4. Reset error state after 15 seconds
      setTimeout(() => {
        setResendState("idle")
        setResendError("")
      }, 15000)
    }
  }

  useEffect(() => {
    if (error) {
      setNotification("error", error)

      setTimeout(() => {
        const nextSearchParams = new URLSearchParams(searchParams.toString())
        nextSearchParams.delete("error")
        router.replace(`${pathname}?${nextSearchParams.toString()}`)
      }, 5000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 5. Get resend button text based on current state
  const getResendText = () => {
    switch (resendState) {
      case "loading":
        return t("auth.resending")
      case "sent":
        return t("auth.resent")
      case "error":
        return t("auth.resend_failed", { message: resendError }) // 1. Use resendError state
      default:
        return t("auth.resend")
    }
  }

  // 6. Get resend button classes with scale effect
  const getResendClasses = () => {
    const baseClasses =
      "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border border-border-color/20 bg-foreground/40 backdrop-blur-sm"

    switch (resendState) {
      case "loading":
        return twMerge(baseClasses, "text-warning cursor-not-allowed opacity-70")
      case "sent":
        return twMerge(baseClasses, "text-success border-success/30 bg-success/10")
      case "error":
        return twMerge(baseClasses, "text-danger border-danger/30 bg-danger/10 cursor-not-allowed")
      default:
        return twMerge(
          baseClasses,
          "text-info border-info/30 bg-info/10 hover:bg-info/20 hover:scale-[0.98] active:scale-[0.96] cursor-pointer",
        )
    }
  }

  const currentStatus = status || "error"
  const StatusIcon = statusConfig[currentStatus].icon

  return (
    <div className="mb-8 space-y-6">
      {/* Header Section - 60% visual weight */}
      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-primary whitespace-pre-line font-bold text-title leading-tight">
          {t(`auth.${authMode}.title`)}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base font-secondary text-subTitle leading-relaxed">
          {t(`auth.${authMode}.subtitle`)}
        </motion.p>
      </div>

      {/* Notification Section - 30% visual weight */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={twMerge(
            "flex items-start gap-4 p-4 rounded-lg border backdrop-blur-sm shadow-sm transition-all duration-300",
            statusConfig[currentStatus].bg,
            statusConfig[currentStatus].border,
            "bg-foreground/40",
          )}>
          {/* Icon - 10% visual weight */}
          <div className="flex-shrink-0 mt-0.5">
            <StatusIcon className={statusConfig[currentStatus].text} size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <p className={twMerge("text-sm font-secondary leading-relaxed", statusConfig[currentStatus].text)}>{notification}</p>

            {/* Resend Button - Only show if email confirmation required and no error state */}
            {notification.includes(t("auth.register.email_confirmation_required")) ||
              (notification.includes(t("auth.register.user_exist_email_not_confirmed")) && resendState !== "error" && (
                <div className="flex items-center justify-start">
                  <button
                    className={`${getResendClasses()} flex justify-center items-center`}
                    onClick={handleResend}
                    disabled={resendState === "loading"}>
                    {resendState === "loading" ? <BiRefresh className="animate-spin" size={16} /> : <BiRefresh size={16} />}

                    {getResendText()}
                  </button>
                </div>
              ))}

            {/* Error State - Show error message without resend option */}
            {resendState === "error" && <p className={getResendClasses()}>{t("auth.resend_failed", { message: resendError })}</p>}
          </div>
        </motion.div>
      )}
    </div>
  )
}
