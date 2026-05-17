import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"

const FAST_DAYS = 30
const SLOW_DAYS = 90

export function getInventoryClassification({
  sales,
  inventory,
}: {
  sales: SalesItem[]
  inventory: Inventory[]
}) {
  const now = Date.now()

  /**
   * Latest sale tracking
   */
  const latestSaleMap = new Map<string, number>()

  /**
   * Sales frequency tracking
   */
  const salesCountMap = new Map<string, number>()

  sales.forEach((sale) => {
    if (!sale.product) return

    const rawDate = sale.timestamp || sale.dateOfIssue

    if (!rawDate) return

    const saleTime = new Date(rawDate).getTime()

    if (Number.isNaN(saleTime)) return

    /**
     * Store latest sale
     */
    const existingLatest = latestSaleMap.get(sale.product)

    if (!existingLatest || saleTime > existingLatest) {
      latestSaleMap.set(sale.product, saleTime)
    }

    /**
     * Increment sales count
     */
    salesCountMap.set(sale.product, (salesCountMap.get(sale.product) || 0) + 1)
  })

  const fastMovingHighValue: Inventory[] = []

  const mediumMovingMediumValue: Inventory[] = []

  const slowMovingLowValue: Inventory[] = []

  const deadStock: Inventory[] = []

  inventory.forEach((item) => {
    /**
     * Ignore empty stock
     */
    if (item.stock <= 0) return

    const latestSaleTime = latestSaleMap.get(item.product)

    const salesCount = salesCountMap.get(item.product) || 0

    /**
     * Never sold
     */
    if (!latestSaleTime) {
      deadStock.push(item)
      return
    }

    const daysSinceLastSale = Math.floor(
      (now - latestSaleTime) / (1000 * 60 * 60 * 24)
    )

    /**
     * FAST MOVING + HIGH VALUE
     */
    if (
      daysSinceLastSale <= FAST_DAYS &&
      item.value >= 10000 &&
      salesCount >= 10
    ) {
      fastMovingHighValue.push(item)
      return
    }

    /**
     * MEDIUM MOVING + MEDIUM VALUE
     */
    if (
      daysSinceLastSale > FAST_DAYS &&
      daysSinceLastSale < SLOW_DAYS &&
      item.value >= 3000
    ) {
      mediumMovingMediumValue.push(item)
      return
    }

    /**
     * DEAD STOCK
     */
    if (daysSinceLastSale >= SLOW_DAYS) {
      deadStock.push(item)
      return
    }

    /**
     * Remaining products
     */
    slowMovingLowValue.push(item)
  })

  return {
    fastMovingHighValue,
    mediumMovingMediumValue,
    slowMovingLowValue,
    deadStock,

    totals: {
      fastMovingHighValue: fastMovingHighValue.length,

      mediumMovingMediumValue: mediumMovingMediumValue.length,

      slowMovingLowValue: slowMovingLowValue.length,

      deadStock: deadStock.length,
    },
  }
}
