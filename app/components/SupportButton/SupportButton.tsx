"use client"

import { RefObject, useRef } from "react"
import useOnEscOrClickOutside from "@/hooks/useOnEscOrClickOutside"
import { IMessageDB } from "@/TS/interfaces/IMessageDB"
import { useSupportDropdown } from "./hooks/useSupportDropdown"
import { useMessagesStore } from "./hooks/useMessages"
import { DropdownContainer } from "./components/DropdownContainer"

interface SupportButton {
  openAIKey: string
  userId: string
  initialMessages: IMessageDB[]
}

export function SupportButton({ openAIKey, userId, initialMessages }: SupportButton) {
  const supportDropdownRef = useRef<HTMLDivElement>(null)

  const { isChatFilePreview, isChatImagePreview } = useMessagesStore()
  const { closeDropdown } = useSupportDropdown()

  useOnEscOrClickOutside(supportDropdownRef, closeDropdown, !isChatFilePreview && !Object.values(isChatImagePreview)[0])

  return (
    <DropdownContainer
      className=""
      classNameIsDropdownTrue=""
      classNameIsDropdownFalse=""
      classNameDropdownContainer=""
      isDropdown={true}
      dropdownRef={supportDropdownRef as RefObject<HTMLDivElement>}>
      {/* Modern Chat Content */}
      <div className="p-4 space-y-4">
        {/* Welcome Message */}
        <div className="bg-foreground rounded-lg p-4 border border-border-color">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center">
              <span className="text-sm">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-title text-sm">Hello! How can I help you today?</p>
              <p className="text-subTitle text-xs mt-1">Just now</p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-foreground rounded-lg p-3 border border-border-color space-y-2">
          <div className="text-xs text-subTitle">
            <p>
              <span className="font-medium text-title">User ID:</span> {userId}
            </p>
            <p>
              <span className="font-medium text-title">Messages:</span> {initialMessages.length} loaded
            </p>
            <p>
              <span className="font-medium text-title">Status:</span> {openAIKey ? "🟢 Connected" : "🔴 Disconnected"}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button className="p-2 bg-brand/10 hover:bg-brand/20 rounded-lg text-brand text-xs font-medium transition-colors">
            📧 Contact Support
          </button>
          <button className="p-2 bg-success/10 hover:bg-success/20 rounded-lg text-success text-xs font-medium transition-colors">
            📚 View FAQ
          </button>
        </div>

        {/* Input Area */}
        <div className="border-t border-border-color pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-foreground border border-border-color rounded-lg text-sm text-title placeholder-subTitle focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <button className="w-8 h-8 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors flex items-center justify-center">
              <span className="text-xs">➤</span>
            </button>
          </div>
        </div>
      </div>
    </DropdownContainer>
  )
}
