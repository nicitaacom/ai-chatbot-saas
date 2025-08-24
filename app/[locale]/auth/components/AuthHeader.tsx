"use client"

import { motion } from "framer-motion"
import { useI18n } from "@/locales/client"
import { MdOutlineErrorOutline } from "react-icons/md"
import useNotification from "@/stores/useError"
import useAuth from "@/features/auth/stores/useAuth"
import { twMerge } from "tailwind-merge"

export function AuthHeader() {
  const t = useI18n()
  const { notification, status } = useNotification()
  const { authMode } = useAuth()

  // Map status to background styles
  const statusClasses = {
    error: "bg-danger/10 text-danger border-danger/30",
    info: "bg-info/10 text-info border-info/30",
    warning: "bg-warning/10 text-warning border-warning/30",
    success: "bg-success/10 text-success border-success/30",
  } as const

  return (
    <div className="mb-8">
      <div className="flex flex-row">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-primary whitespace-pre-line font-bold text-title mb-2 ">
          {t(`auth.${authMode}.title`)}
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-subTitle font-primary">
        {t(`auth.${authMode}.subtitle`)}
      </motion.p>

      {notification && (
        <div
          className={twMerge(
            "flex flex-row gap-x-3 items-start backdrop-blur-sm rounded-lg border p-4 shadow-sm transition-all duration-200 mt-1",
            statusClasses[status || "error"],
          )}>
          <div className="flex-shrink-0 mt-0.5">
            <MdOutlineErrorOutline className={twMerge(statusClasses[status || "error"]?.split(" ")[1])} size={18} />
          </div>
          <p className="text-sm font-secondary leading-relaxed">{notification}</p>
        </div>
      )}
    </div>
  )
}
