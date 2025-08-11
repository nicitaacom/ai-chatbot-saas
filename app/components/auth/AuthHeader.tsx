"use client"

import { motion } from "framer-motion"

import { useI18n } from "@/locales/client"
import { TAuthMode } from "@/ts/types/TAuthMode"

export function AuthHeader({ mode }: { mode: TAuthMode }) {
  const t = useI18n()

  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-primary font-bold text-title mb-2 whitespace-pre-line">
        {t(`auth.${mode}.title`)}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-subTitle font-primary">
        {t(`auth.${mode}.subtitle`)}
      </motion.p>
    </div>
  )
}
