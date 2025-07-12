"use client"

import { useEffect, useState } from "react"
import { nanoid } from "nanoid"
import { useSearchParams } from "next/navigation"

import { IMessageDB } from "@/interfaces/IMessageDB"
import { SupportButton } from "@/components/SupportButton/SupportButton"

export default function EmbedPage() {
  const params = useSearchParams()
  const widgetId = params.get("widgetId")

  const [initialMessages, setInitialMessages] = useState<IMessageDB[]>([])
  const [openAIKey, setOpenAIKey] = useState("")
  const [userId, setUserId] = useState("")

  // 1. Ensure anonymous userId exists
  useEffect(() => {
    let storedId = localStorage.getItem("anonymousId")
    if (!storedId) {
      storedId = nanoid()
      localStorage.setItem("anonymousId", storedId)
    }
    setUserId(storedId)
  }, [])

  // 2. Fetch messages once widgetId & userId are ready
  useEffect(() => {
    if (!widgetId || !userId) return

    fetch("/api/widget/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgetId, userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.messages) setInitialMessages(data.messages)
        if (data.openAIKey) setOpenAIKey(data.openAIKey)
        if (data.userId) setOpenAIKey(data.userId)
      })
      .catch(console.error)
  }, [widgetId, userId])

  useEffect(() => {
    // 1. Set background to transparent + reset margin/padding
    document.body.style.background = "transparent"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.documentElement.style.background = "transparent"
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
  }, [])

  if (!widgetId) return <div>❌ Missing widget ID</div>
  if (!userId) return null // wait for anon ID to be ready

  return <SupportButton userId={userId} initialMessages={initialMessages} openAIKey={openAIKey} />
}
