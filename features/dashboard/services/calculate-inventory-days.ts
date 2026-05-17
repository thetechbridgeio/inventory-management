// services/inventory/calculate-average-inventory-days.ts

import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"

const DEFAULT_ANALYSIS_DAYS = 30

export function calculateAverageInventoryDays({
  sales,
  inventory,
  analysisDays = DEFAULT_ANALYSIS_DAYS,
}: {
  sales: SalesItem[]
  inventory: Inventory[]
  analysisDays?: number
}) {
  /**
   * Product sales quantity map
   */
  const productSalesMap = new Map<string, number>()

  sales.forEach((sale) => {
    if (!sale.product) return

    const quantity = Number(sale.quantity) || 0

    productSalesMap.set(
      sale.product,
      (productSalesMap.get(sale.product) || 0) + quantity
    )
  })

  /**
   * Calculate inventory days
   */
  const inventoryDaysList = inventory
    .filter((item) => item.stock > 0)
    .map((item) => {
      const totalSold = productSalesMap.get(item.product) || 0

      const averageDailySales = totalSold / analysisDays

      /**
       * Ignore products with no sales
       */
      if (averageDailySales <= 0) {
        return 0
      }

      return item.stock / averageDailySales
    })
    .filter((days) => days > 0)

  /**
   * Overall average inventory days
   */
  if (inventoryDaysList.length === 0) {
    return 0
  }

  const averageInventoryDays =
    inventoryDaysList.reduce((acc, days) => acc + days, 0) /
    inventoryDaysList.length

  return Number(averageInventoryDays.toFixed(1))
}
