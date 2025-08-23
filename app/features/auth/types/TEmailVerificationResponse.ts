export type TEmailVerificationResponse = {
  address: string
  status: string
  sub_status: string
  free_email: boolean
  did_you_mean: string | null
  account: string
  domain: string
  domain_age_days: number | null
  smtp_provider: string
  mx_found: boolean | string // Assuming it can be a string ("true"/"false") or boolean
  mx_record: string
  firstname: string | null
  lastname: string | null
  gender: string | null
  country: string | null
  region: string | null
  city: string | null
  zipcode: string | null
  processed_at: string // ISO formatted date string
}
