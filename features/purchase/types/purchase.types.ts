export interface Purchase {
  product: string
  quantity: number
  unit: string
  poNumber: string
  supplier: string
  dateOfReceiving: string
  rackNumber: string
  timestamp?: string
}

export interface ClientSession {
  clientId: string
  sheetId: string
}
