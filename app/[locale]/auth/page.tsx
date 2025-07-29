"use client"

import { AuthForm } from "@/components/auth/AuthForm/AuthForm"
import { AuthIllustration } from "@/components/auth/AuthIllustration"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left side - Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full mb-4" />
            </div>

            <AuthForm />
          </div>
        </div>

        {/* Right side - Illustration */}
        <AuthIllustration />
      </div>
    </div>
  )
}
