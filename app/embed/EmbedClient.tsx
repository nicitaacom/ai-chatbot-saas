"use client"

import { useEffect, useState } from "react"
import { nanoid } from "nanoid"
import { useSearchParams } from "next/navigation"
import { IMessageDB } from "@/TS/interfaces/IMessageDB"
import { SupportButton } from "@/components/SupportButton/SupportButton"

export default function EmbedClient() {
  const widgetId = useSearchParams().get("widgetId")
  const [initialMessages, setInitialMessages] = useState<IMessageDB[]>([])
  const [openAIKey, setOpenAIKey] = useState("")
  const [userId, setUserId] = useState("")

  // 🔐 1. Ensure anon userId
  useEffect(() => {
    const id = localStorage.getItem("anonymousId") || nanoid()
    localStorage.setItem("anonymousId", id)
    setUserId(id)
  }, [])

  // 🚀 2. Fetch widget messages once widgetId + userId ready
  useEffect(() => {
    if (!widgetId || !userId) return

    fetch("/api/widget/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgetId, userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data?.messages) setInitialMessages(data.messages)
        if (data?.openAIKey) setOpenAIKey(data.openAIKey)
        if (data?.userId) setUserId(data.userId)
      })
      .catch(console.error)
  }, [widgetId, userId])

  // 🎨 3. Reset styling for embed
  useEffect(() => {
    const transparentCSS = `background: transparent; margin: 0; padding: 0;`
    document.documentElement.style.cssText = transparentCSS
    document.body.style.cssText = transparentCSS
  }, [])

  if (!widgetId) return <div>❌ Missing widget ID</div>
  if (!userId) return null

  return <SupportButton userId={userId} initialMessages={initialMessages} openAIKey={openAIKey} />
}
