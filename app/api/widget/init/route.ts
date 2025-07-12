// import supabaseAdmin from "@/libs/supabaseAdmin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { userId, widgetId } = await req.json()

  // fetch smth by userId

  return NextResponse.json({
    openAIKey: `API key from ${widgetId}`,
    messages: [],
  })
}
