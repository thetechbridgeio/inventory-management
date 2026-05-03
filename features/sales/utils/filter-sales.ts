import { SalesItem } from "../types/sale-entry-form.types"
import { SalesFilterState } from "../types/sale-entry-form.types"

export function filterSales(data: SalesItem[], filters: SalesFilterState) {
  return data.filter((item) => {
    if (filters.product.length && !filters.product.includes(item.product)) return false
    if (filters.company.length && !filters.company.includes(item.companyName)) return false

    if (filters.dateRange.from || filters.dateRange.to) {
      const itemDate = new Date(item.dateOfIssue)

      if (filters.dateRange.from && itemDate < filters.dateRange.from) return false

      if (filters.dateRange.to) {
        const end = new Date(filters.dateRange.to)
        end.setDate(end.getDate() + 1)
        if (itemDate > end) return false
      }
    }

    if (filters.search) {
      const s = filters.search.toLowerCase()
      return (
        item.product?.toLowerCase().includes(s) ||
        item.contact?.toLowerCase().includes(s) ||
        item.companyName?.toLowerCase().includes(s)
      )
    }

    return true
  })
}