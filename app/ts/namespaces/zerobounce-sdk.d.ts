declare module "@zerobounce/zero-bounce-sdk" {
  export default class ZeroBounceSDK {
    constructor()
    init(apiKey: string): void
    getCredits(): Promise<any>
    validateEmail(email: string, ipAddress?: string): Promise<any>
    getApiUsage(startDate: string, endDate: string): Promise<any>
    validateBatch(emailBatch: Array<{ email_address: string }>): Promise<any>
    getEmailActivity(email: string): Promise<any>
    sendFile(payload: {
      file: File
      email_address_column: number
      return_url?: string
      first_name_column?: number
      last_name_column?: number
      gender_column?: number
      ip_address_column?: number
      has_header_row?: boolean
      remove_duplicate?: boolean
    }): Promise<any>
    sendScoringFile(payload: {
      file: File
      email_address_column: number
      return_url?: string
      has_header_row?: boolean
      remove_duplicate?: boolean
    }): Promise<any>
    getFileStatus(fileId: string): Promise<any>
    getScoringFileStatus(fileId: string): Promise<any>
    getFile(fileId: string): Promise<any>
    getScoringFile(fileId: string): Promise<any>
    deleteFile(fileId: string): Promise<any>
    deleteScoringFile(fileId: string): Promise<any>
    guessFormat(payload: { domain: string; first_name?: string; middle_name?: string; last_name?: string }): Promise<any>
  }
}
