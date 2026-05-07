export interface PurchaseItem {
  srNo: number
  product: string
  quantity: number
  unit: string
  poNumber: string
  supplier: string
  dateOfReceiving: string
  rackNumber: string
  timestamp?: string
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

export interface PurchaseEntryForm {
  product: string
  quantity: string
  unit: string
  poNumber: string
  supplier: string
  newSupplier: string
  dateOfReceiving: Date
  rackNumber: string
}