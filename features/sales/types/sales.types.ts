export interface SalesItem {
  product: string
  quantity: number
  unit: string
  contact: string
  companyName: string
  dateOfIssue: string
  timestamp?: string
}

export interface ClientSession {
  clientId: string
  sheetId: string
}
