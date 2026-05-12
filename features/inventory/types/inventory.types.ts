export interface Inventory {
  product: string
  category: string
  unit: string
  minimumQuantity: number
  maximumQuantity: number
  reorderQuantity: number
  stock: number
  pricePerUnit: number
  value: number
  timestamp?: string
  location?: string
  productType: "Raw" | "Finished"
  openingStock?: number
}

export interface ClientSession {
  clientId: string
  sheetId: string
}
