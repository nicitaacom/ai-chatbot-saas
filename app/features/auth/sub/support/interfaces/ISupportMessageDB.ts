export interface ISupportMessageDB {
  id: string
  created_at: string
  ticket_id: string
  sender_id: string
  sender_username: string
  body?: string | null
  image_url?: string | null
  seen?: boolean
}
