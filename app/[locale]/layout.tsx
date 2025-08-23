import { ReactElement } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/Navbar/Navbar"
import { I18nProviderClient } from "@/locales/client"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI chatbot",
  description: "AI chatbot trained on CX",
}

export default function RootLayout({ params: { locale }, children }: { params: { locale: string }; children: ReactElement }) {
  return (
    <html lang="en" className="dark">
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

      <body className={inter.className}>
        <I18nProviderClient locale={locale}>
          <div className="relative w-full h-[calc(100%-32px)] flex flex-col">
            <Navbar />
            {children}
          </div>
        </I18nProviderClient>
      </body>
    </html>
  )
}
