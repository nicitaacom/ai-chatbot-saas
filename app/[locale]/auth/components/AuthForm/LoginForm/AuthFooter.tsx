"use client"

import { useState } from "react"
import { Checkbox } from "antd"
import useAuth from "@/features/auth/stores/useAuth"
import { useI18n } from "@/locales/client"

export function AuthFooter() {
  const t = useI18n()
  const { setAuthMode } = useAuth()
  const [rememberMe, setRememberMe] = useState(false)

  const handleCheckboxChange = (e: { target: { checked: boolean } }) => {
    setRememberMe(e.target.checked)
  }

  const handleTextClick = () => {
    setRememberMe(!rememberMe)
  }

  return (
    <div className="flex items-center justify-between">
      {/* Remember Me Checkbox with Ring Animation */}
      <div className="flex items-center">
        <div className="relative w-6 h-6">
          {/* Animated Ring - appears when checking/unchecked */}
          <div
            className={`absolute top-[3px] left-[0px] w-5 h-5 rounded pointer-events-none
                        shadow-sm shadow-brand/20 backdrop-blur-sm
                        ${
                          rememberMe
                            ? "animate-[ringExpand_500ms_ease-out_forwards]"
                            : "animate-[ringContract_500ms_ease-out_forwards]"
                        }
                        opacity-0`}
          />

          <Checkbox
            checked={rememberMe}
            onChange={handleCheckboxChange}
            className="relative z-10
                       [&_.ant-checkbox-inner]:!bg-foreground/40 
                       [&_.ant-checkbox-inner]:!border-border-color/20 
                       [&_.ant-checkbox-inner]:!shadow-sm
                       [&_.ant-checkbox-inner]:!backdrop-blur-sm
                       [&_.ant-checkbox-inner]:!rounded
                       [&_.ant-checkbox-inner]:!w-5 
                       [&_.ant-checkbox-inner]:!h-5
                       [&_.ant-checkbox-inner]:!transition-all 
                       [&_.ant-checkbox-inner]:!duration-300
                       [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-foreground
                       [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-brand
                       [&_.ant-checkbox]:!active:scale-95
                       hover:[&_.ant-checkbox-inner]:!border-brand/60"
          />
        </div>
        <span className="text-sm text-subTitle font-medium ml-1 mt-0.5 select-none cursor-pointer" onClick={handleTextClick}>
          {t("auth.remember.me")}
        </span>
      </div>

      {/* Forgot Password Button */}
      <button
        type="button"
        onClick={() => setAuthMode("recovery")}
        className="text-sm text-brand hover:text-brand/80 font-medium 
                   active:scale-98 transition-all duration-200">
        {t("auth.forgot.password")}
      </button>
    </div>
  )
}
