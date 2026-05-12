export interface AuthClient {
  id: string
  sheetId: string
  companyName: string
  logoUrl?: string
}

export interface LoginCredentials {
  username: string
  password: string
}
