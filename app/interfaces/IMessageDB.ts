export interface IMessageDB {
  id: string
  created_at: string
  ticket_id: string
  sender_id: string
  sender_username: string
  body?: string | null
  image_url?: string | null
  sender_avatar_url: string | undefined | null
  seen?: boolean
  is_open: boolean
}
