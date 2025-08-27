"use client"

import { AuthForm } from "@/[locale]/auth/components/AuthForm/AuthForm"
import { OrganicCanvasBackground } from "@/components/Canvas"
import useThemeStore from "@/stores/useThemeStore"
import { Slider } from "./components/AuthForm/Slider"

export default function AuthPage() {
  const { theme } = useThemeStore()

  // Map theme to HSL values - it's not feature related - just styles (component related)
  const getThemeHsl = (themeName: string) => {
    const hslMap: Record<string, string> = {
      dark: "0, 0%, 60%",
      red: "0, 84%, 60%",
      orange: "25, 95%, 53%",
      yellow: "45, 93%, 47%",
      green: "142, 76%, 36%",
      turquoise: "178, 84%, 40%",
      blue: "217, 91%, 60%",
      purple: "271, 91%, 65%",
    }
    return hslMap[themeName] || "0, 0%, 60%"
  }

  return (
    <OrganicCanvasBackground className="min-h-screen bg-background" brandHsl={getThemeHsl(theme)} particleCount={6}>
      <div className="relative z-10 grid grid-cols-1 laptop:grid-cols-2 min-h-screen">
        {/* Left Panel - Auth Form */}
        <div className="flex items-center justify-center p-8 laptop:p-16">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>

        {/* Right Panel - Slider */}
        <Slider getThemeHsl={getThemeHsl} />
      </div>
    </OrganicCanvasBackground>
  )
}
