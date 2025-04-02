export interface InventoryItem {
  srNo: number
  product: string
  category: string
  unit: string
  minimumQuantity: number
  maximumQuantity: number
  reorderQuantity: number
  stock: number
  pricePerUnit: number
  value: number
}

export interface PurchaseItem {
  srNo: number
  product: string
  quantity: number
  unit: string
  poNumber: string
  supplier: string
  dateOfReceiving: string
  rackNumber: string
}

export interface SalesItem {
  srNo: number
  product: string
  quantity: number
  unit: string
  contact: string
  companyName: string
  dateOfIssue: string
}

export interface Supplier {
  supplier: string
  companyName: string
}

export interface StockStatus {
  label: string
  value: string
}

export interface FilterState {
  category: string[]
  stockStatus: string
  search: string
}

export interface PurchaseFilterState {
  product: string[]
  supplier: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  search: string
}

export interface SalesFilterState {
  product: string[]
  company: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  search: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  logoUrl?: string
  sheetId?: string
  username?: string
  password?: string
}

