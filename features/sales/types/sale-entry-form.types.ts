export interface SalesEntryForm {
  product: string
  quantity: string
  unit: string
  contact: string
  companyName: string
  newCompany: string
  dateOfIssue: Date
}

export const emptyEntry = (): SalesEntryForm => ({
  product: "",
  quantity: "",
  unit: "",
  contact: "",
  companyName: "",
  newCompany: "",
  dateOfIssue: new Date(),
})

export interface SalesItem {
  srNo: number | string
  product: string
  quantity: number
  unit: string
  contact: string
  companyName: string
  dateOfIssue: string
  timestamp?: string
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