"use client"

import { useEffect, useRef, useState } from "react"
import { IoMdArrowDropdown } from "react-icons/io"
import { motion } from "framer-motion"
import { FaCheck } from "react-icons/fa"

import useOnEscOrClickOutside from "@/hooks/useOnEscOrClickOutside"
import useThemeStore from "@/stores/useThemeStore"
import { TTheme } from "@/ts/types/TThemeAndPaddings"

export function ThemeChanger() {
  const { theme, setTheme } = useThemeStore()
  const themeRef = useRef<HTMLDivElement>(null)
  const [isDropdown, setIsDropdown] = useState(false)

  const colors: Array<{ name: TTheme; bg: string }> = [
    { name: "dark", bg: "bg-gray-700" },
    { name: "red", bg: "bg-red-500" },
    { name: "orange", bg: "bg-orange-500" },
    { name: "yellow", bg: "bg-yellow-500" },
    { name: "green", bg: "bg-green-500" },
    { name: "turquoise", bg: "bg-teal-500" },
    { name: "blue", bg: "bg-blue-500" },
    { name: "purple", bg: "bg-purple-500" },
  ]

  const currentTheme = colors.find(c => c.name === theme)

  // Function to update the HTML element class
  const setDocumentTheme = (themeName: TTheme) => {
    if (typeof window !== "undefined") {
      colors.forEach(color => document.documentElement.classList.remove(color.name))
      if (themeName) {
        document.documentElement.classList.add(themeName)
        setTheme(themeName)
      }
      setIsDropdown(false)
    }
  }

  useEffect(() => {
    if (theme) setDocumentTheme(theme)
  }, [])

  useOnEscOrClickOutside(themeRef, () => setIsDropdown(false), isDropdown)

  return (
    <div className="relative" ref={themeRef}>
      <motion.button
        onClick={() => setIsDropdown(o => !o)}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/60 hover:bg-gray-100/60 dark:bg-gray-800/50 dark:hover:bg-gray-700/60 transition-colors border border-gray-200/30">
        <div className={`w-3 h-3 rounded-full ${currentTheme?.bg}`} />
        <span className="text-sm text-gray-700 dark:text-gray-200">{currentTheme?.name}</span>
        <IoMdArrowDropdown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdown ? "rotate-180" : ""}`} />
      </motion.button>

      <motion.div
        initial={false}
        animate={{
          opacity: isDropdown ? 1 : 0,
          y: isDropdown ? 0 : -10,
          visibility: isDropdown ? "visible" : "hidden",
        }}
        transition={{ duration: 0.25 }}
        className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 border border-gray-200/30 rounded-lg shadow-md z-50 py-1">
        {colors.map(c => (
          <motion.button
            key={c.name}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDocumentTheme(c.name)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${c.bg}`} />
              <span>{c.name}</span>
            </div>
            {theme === c.name && <FaCheck className="text-green-500 w-4 h-4" />}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
