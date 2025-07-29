// import supabaseAdmin from "@/libs/supabaseAdmin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { widgetId } = await req.json()
  // const { userId, widgetId } = await req.json()

  // TODO fetch smth by userId

  return NextResponse.json({
    openAIKey: `API key from ${widgetId}`,
    messages: [],
  })
}
