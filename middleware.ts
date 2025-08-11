// middleware.ts
import { createI18nMiddleware } from "next-international/middleware"
import { NextRequest } from "next/server"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "lt"],
  defaultLocale: "en",
  urlMappingStrategy: "rewriteDefault",
})

export function middleware(request: NextRequest) {
  return I18nMiddleware(request)
}

// exclude: api, static, _next, files, embed
export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt|embed|auth/callback).*)"],
}
