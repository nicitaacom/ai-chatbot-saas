export interface ISupportTicketDB {
  owner_id: string // uuid
  id: string // uuid
  created_at: string // ISO
  subject: string
  rating: number | null // 1-5
  owner_username: string
  is_open: boolean
}
