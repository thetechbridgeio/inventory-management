// features/inventory/types/low-stock.types.ts

export interface LowStockCompanyDetails {
  name: string
  email?: string
  phone?: string
}

export interface LowStockItem {
  productName: string

  currentStock: number
  minimumStock: number

  reorderQuantity: number

  category?: string
  unit: string
}

export interface GenerateLowStockPDFInput {
  company: LowStockCompanyDetails

  generatedBy: string

  requestId: string

  items: LowStockItem[]

  generatedAt?: Date
}
