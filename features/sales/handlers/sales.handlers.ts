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

export function salesItemsMatch(salesA: SalesItem, salesB: SalesItem) {
  return (
    salesA.product.trim().toLowerCase() ===
      salesB.product.trim().toLowerCase() &&
    salesA.companyName.trim().toLowerCase() ===
      salesB.companyName.trim().toLowerCase() &&
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
