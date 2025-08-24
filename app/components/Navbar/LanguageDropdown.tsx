"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import { FaCheck, FaGlobe } from "react-icons/fa"
import { IoMdArrowDropdown } from "react-icons/io"

import { TLocaleTag } from "@/ts/types/TLocaleTag"
import { useChangeLocale, useCurrentLocale } from "@/locales/client"
import useOnEscOrClickOutside from "@/hooks/useOnEscOrClickOutside"

type Locale = {
  code: TLocaleTag
  name: string
  flag: string
}

const locales: Locale[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "lv", name: "Latvian", flag: "🇱🇻" },
]

export function LanguageDropdown() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const langRef = useRef<HTMLDivElement>(null)

  const changeLocale = useChangeLocale()
  const locale = useCurrentLocale()
  const currentLocale = locales.find(l => l.code === locale)

  // close dropdowns on ESC or outside click
  useOnEscOrClickOutside(langRef, () => setIsDropdownOpen(false), isDropdownOpen)

  const handleLocaleChange = (code: TLocaleTag) => {
    changeLocale(code)
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative" ref={langRef}>
      <motion.button
        onClick={() => setIsDropdownOpen(o => !o)}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/60 hover:bg-gray-100/60 dark:bg-gray-800/50 dark:hover:bg-gray-700/60 transition-colors border border-gray-200/30">
        <FaGlobe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {currentLocale?.flag} {currentLocale?.name}
        </span>
        <IoMdArrowDropdown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <motion.div
        initial={false}
        animate={{
          opacity: isDropdownOpen ? 1 : 0,
          y: isDropdownOpen ? 0 : -10,
          visibility: isDropdownOpen ? "visible" : "hidden",
        }}
        transition={{ duration: 0.25 }}
        className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200/30 rounded-lg shadow-md z-50 py-1">
        {locales.map(l => (
          <motion.button
            key={l.code}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLocaleChange(l.code)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </div>
            {locale === l.code && <FaCheck className="text-green-500 w-4 h-4" />}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
