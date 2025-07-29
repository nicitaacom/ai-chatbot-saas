import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI chatbot",
  description: "AI chatbot trained on CX",
}

export default function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
