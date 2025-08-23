"use server"

export async function sendMsgInTgAction(messageBody: string) {
  const messageTg = `${messageBody}`
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID
  const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`

  const responseTg = await fetch(URI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      parse_mode: "html",
      text: messageTg,
    }),
  })

  if (responseTg.status >= 300) console.log(21, "responseTg - ", responseTg.status >= 300)
}
