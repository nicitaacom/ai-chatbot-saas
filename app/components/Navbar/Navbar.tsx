"use client"

import { useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import useThemeStore from "@/stores/useThemeStore"
import { ThemeChanger } from "./ThemeChanger"
import { getCookie } from "@/utils/helpersCSR"
import { LanguageDropdown } from "./LanguageDropdown"
import useAuth from "@/features/auth/stores/useAuth"

export const Navbar = () => {
  const jwt = getCookie("auth_token")

  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    if (!theme) setTheme("dark")
  }, [])

  const { logout } = useAuth()

  return (
    <nav
      className="relative z-50 rounded-lg border border-gray-200/20 bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-sm
    px-6 py-3 mx-4 mt-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">AI chatbot</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auth Link */}
          {jwt ? (
            <motion.button
              onClick={logout}
              whileTap={{ scale: 0.98 }}
              className="text-sm font-medium hover:text-info/80 transition-colors">
              Logout
            </motion.button>
          ) : (
            <Link href="/auth">
              <motion.span
                whileTap={{ scale: 0.98 }}
                className="text-sm font-medium hover:text-info/80 transition-colors cursor-pointer">
                Login
              </motion.span>
            </Link>
          )}

          {/* Theme Dropdown */}
          <ThemeChanger />

          {/* Language Dropdown */}
          <LanguageDropdown />
        </div>
      </div>
    </nav>
  )
}
