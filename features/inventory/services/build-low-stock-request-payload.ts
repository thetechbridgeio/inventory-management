// features/inventory/utils/build-low-stock-request-payload.ts

import { LowStockItem } from "../types/low-stock.types"

type BuildPayloadParams = {
  products: any[]
  restockValues: Record<string, number>
}

export function buildLowStockRequestPayload({
  products,
  restockValues,
}: BuildPayloadParams): LowStockItem[] {
  return products.map((item) => ({
    productName: item.product,

    currentStock: item.stock,

    minimumStock: item.minimumQuantity,

    reorderQuantity: restockValues[item.product] || item.reorderQuantity || 1,

    category: item.category,
    unit: item.unit,
  }))
}
