"use client"

import { useState, useEffect, useRef } from "react"
import { useChangeLocale, useCurrentLocale } from "@/locales/client"
import { FaCheck, FaGlobe } from "react-icons/fa"
import { IoMdArrowDropdown } from "react-icons/io"
import { motion } from "framer-motion"
import useThemeStore from "@/stores/useThemeStore"
import { TLocaleTag } from "@/TS/types/TLocale"
import useOnEscOrClickOutside from "@/hooks/useOnEscOrClickOutside"
import { ThemeChanger } from "./ThemeChanger"

const locales = [
  { code: "en" as TLocaleTag, name: "English", flag: "🇺🇸" },
  { code: "lt" as TLocaleTag, name: "Latvian", flag: "🇱🇻" },
]

export const Navbar = () => {
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const changeLocale = useChangeLocale()
  const locale = useCurrentLocale()
  const currentLocale = locales.find(l => l.code === locale)

  const { theme, setTheme } = useThemeStore()

  // close dropdowns on ESC or outside click
  useOnEscOrClickOutside(langRef, () => setLangOpen(false), langOpen)

  useEffect(() => {
    if (!theme) setTheme("dark")
  })

  const handleLocaleChange = (code: TLocaleTag) => {
    changeLocale(code)
    setLangOpen(false)
  }

  return (
    <nav className="relative z-50 px-6 py-3 mt-4 mx-4 rounded-xl border border-gray-200/20 bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">AI chatbot</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Dropdown */}
          <ThemeChanger />

          {/* Language Dropdown */}
          <div className="relative" ref={langRef}>
            <motion.button
              onClick={() => setLangOpen(o => !o)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/60 hover:bg-gray-100/60 dark:bg-gray-800/50 dark:hover:bg-gray-700/60 transition-colors border border-gray-200/30">
              <FaGlobe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {currentLocale?.flag} {currentLocale?.name}
              </span>
              <IoMdArrowDropdown className={`w-4 h-4 text-gray-400 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <motion.div
              initial={false}
              animate={{
                opacity: langOpen ? 1 : 0,
                y: langOpen ? 0 : -10,
                visibility: langOpen ? "visible" : "hidden",
              }}
              transition={{ duration: 0.25 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-gray-200/30 rounded-xl shadow-md z-50 py-1">
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
        </div>
      </div>
    </nav>
  )
}
