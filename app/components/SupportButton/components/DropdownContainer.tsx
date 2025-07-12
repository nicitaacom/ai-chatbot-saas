"use client"

import { BiSupport } from "react-icons/bi"
import { AiOutlineClose } from "react-icons/ai"
import { twMerge } from "tailwind-merge"

interface DropdownContainerProps {
  children: React.ReactNode
  className?: string
  classNameDropdownContainer?: string
  classNameIsDropdownTrue?: string
  classNameIsDropdownFalse?: string
  username?: string | undefined
  onClick?: () => void
  isDropdown: boolean
  dropdownRef: React.RefObject<HTMLDivElement>
}

export function DropdownContainer({
  children,
  username,
  className = "",
  classNameDropdownContainer = "",
  classNameIsDropdownTrue,
  classNameIsDropdownFalse,
  isDropdown,
  onClick,
  dropdownRef,
}: DropdownContainerProps) {
  return (
    <div className={`fixed bottom-0 right-0 z-[99] ${classNameDropdownContainer}`} ref={dropdownRef}>
      <div
        className={twMerge(
          `absolute bottom-[80px] right-4 w-[320px] mobile:w-[400px] z-[99] text-title
      before:w-4 before:h-4 before:bg-background before:border-l-[1px] before:border-t-[1px] before:border-solid before:border-border-color
       before:rotate-45 before:absolute before:bottom-[-8px] before:right-[24px] before:transform`,
          isDropdown
            ? `opacity-100 visible translate-y-0 scale-100 transition-all duration-300 ease-out ${classNameIsDropdownTrue}`
            : `opacity-0 invisible translate-y-2 scale-95 transition-all duration-200 ease-in ${classNameIsDropdownFalse}`,
          className,
        )}>
        <div className="bg-background border-[1px] border-solid border-border-color rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-brand p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <BiSupport className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Support Chat</h3>
                {username ? (
                  <p className="text-white/80 text-xs">Hi {username}! 👋</p>
                ) : (
                  <p className="text-white/80 text-xs">We're here to help</p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  )
}
