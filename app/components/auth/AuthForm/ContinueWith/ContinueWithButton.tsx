import React from "react"
import { FcGoogle } from "react-icons/fc"
import { Button } from "antd"

import supabaseClient from "@/libs/supabaseClient"
import useAuth from "@/stores/useAuth"
import { useCurrentLocale } from "@/locales/client"

export function ContinueWithGoogleButton({ className }: { className?: string }) {
  const { setAuthError } = useAuth()
  const locale = useCurrentLocale()
  async function continueWith(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback/oauth?provider=google&locale=${locale}` },
    })
    if (error) setAuthError(error.message)
  }

  return (
    <form onSubmit={continueWith}>
      <Button
        htmlType="submit"
        className={`
        w-full h-12 flex items-center justify-center gap-3
        bg-foreground/40 border rounded-lg !border-info/40
        text-title shadow-sm transition-all duration-200 active:scale-[0.98]
        hover:!bg-foreground/60 hover:shadow-md
        focus:!bg-foreground/60 active:!bg-foreground/60
        [&.ant-btn:focus]:!bg-foreground/60 [&.ant-btn:active]:!bg-foreground/60
        ${className}
      `}>
        <FcGoogle className="text-xl" />
        <span className="font-medium text-base">Continue with Google</span>
      </Button>
    </form>
  )
}
