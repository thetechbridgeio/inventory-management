import { subDays, isAfter, parseISO } from "date-fns"

import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"

export function getLast30DaysSalesValue(
  sales: SalesItem[],
  inventory: Inventory[]
) {
  const thirtyDaysAgo = subDays(new Date(), 30)

  return sales.reduce((acc, sale) => {
    if (!sale.dateOfIssue) return acc

    const saleDate = parseISO(sale.dateOfIssue)

    // Skip sales older than 30 days
    if (!isAfter(saleDate, thirtyDaysAgo)) {
      return acc
    }

    const inventoryItem = inventory.find(
      (item) => item.product === sale.product
    )

    const productPrice = inventoryItem?.pricePerUnit || 0

    return acc + Number(sale.quantity || 0) * productPrice
  }, 0)
}
