import { normalize } from "@/lib/normalize"
import { SalesItem } from "../types/sales.types"

export function normalizeSalesItem(salesItem: SalesItem): SalesItem {
  return {
    product: salesItem.product.trim(),

    quantity: Number(salesItem.quantity),

    unit: salesItem.unit.trim(),

    contact: salesItem.contact.trim(),

    companyName: salesItem.companyName.trim(),

    dateOfIssue: salesItem.dateOfIssue.trim(),

    timestamp: salesItem.timestamp || new Date().toISOString(),
  }
}

export function salesItemsMatch(salesA: SalesItem, salesB: SalesItem): boolean {
  return (
    normalize(salesA.product) === normalize(salesB.product) &&
    normalize(salesA.companyName) === normalize(salesB.companyName) &&
    salesA.dateOfIssue === salesB.dateOfIssue
  )
}

export function salesItemExists(
  salesItems: SalesItem[],
  targetSalesItem: SalesItem
) {
  return salesItems.some((salesItem) =>
    salesItemsMatch(salesItem, targetSalesItem)
  )
}

export function getTotalSalesQuantity(salesItems: SalesItem[]) {
  return salesItems.reduce(
    (total, salesItem) => total + Number(salesItem.quantity || 0),
    0
  )
}
