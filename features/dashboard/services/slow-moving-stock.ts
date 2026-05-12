import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"

const THRESHOLD_DAYS = 90

export function getSlowMovingStock({
  sales,
  inventory,
}: {
  sales: SalesItem[]
  inventory: Inventory[]
}) {
  const now = Date.now()

  /**
   * Store latest sale timestamp per product
   */
  const latestSaleMap = new Map<string, number>()

  /**
   * Build latest sale lookup
   */
  sales.forEach((sale) => {
    if (!sale.product) return

    const rawDate = sale.timestamp || sale.dateOfIssue

    if (!rawDate) return

    const saleTime = new Date(rawDate).getTime()

    /**
     * Ignore invalid dates
     */
    if (Number.isNaN(saleTime)) return

    const existingSaleTime = latestSaleMap.get(sale.product)

    /**
     * Keep latest timestamp only
     */
    if (!existingSaleTime || saleTime > existingSaleTime) {
      latestSaleMap.set(sale.product, saleTime)
    }
  })

  /**
   * Filter slow moving products
   */
  const slowMovingProducts = inventory.filter((item) => {
    /**
     * Ignore products with no stock
     */
    if (item.stock <= 0) {
      return false
    }

    const latestSaleTime = latestSaleMap.get(item.product)

    /**
     * No sales found
     * => slow moving
     */
    if (!latestSaleTime) {
      return true
    }

    const daysSinceLastSale = Math.floor(
      (now - latestSaleTime) / (1000 * 60 * 60 * 24)
    )

    return daysSinceLastSale >= THRESHOLD_DAYS
  })

  return {
    slowMovingProducts,

    totalSlowMovingProducts: slowMovingProducts.length,
  }
}
