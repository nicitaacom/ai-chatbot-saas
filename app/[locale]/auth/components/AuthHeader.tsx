"use client"

import { motion } from "framer-motion"

import { useI18n } from "@/locales/client"
import { MdOutlineErrorOutline } from "react-icons/md"
import useError from "@/stores/useError"
import useAuth from "@/features/auth/stores/useAuth"

export function AuthHeader() {
  const t = useI18n()
  const { error } = useError()
  const { authMode } = useAuth()

  return (
    <div className="mb-8">
      <div className="flex flex-row ">
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

      {error && (
        <div
          className="flex flex-row gap-x-3 items-start bg-danger/10 backdrop-blur-sm rounded-lg
                border border-border-color/40 p-4 shadow-sm transition-all duration-200 hover:bg-foreground/50">
          <div className="flex-shrink-0 mt-0.5">
            <MdOutlineErrorOutline className="text-danger" size={18} />
          </div>
          <p className="text-title text-sm font-secondary leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  )
}
