import { Inventory } from "@/features/inventory/types/inventory.types"

export function getStockStatus(inventory: Inventory[]) {
  let lowStock = 0
  let lowStockProducts: Inventory[] = []
  let negativeStockProducts: Inventory[] = []
  let normalStock = 0
  let excessStock = 0
  let negativeStock = 0

  inventory.forEach((item) => {
    const stock = Number(item.stock)

    if (stock <= 0) {
      negativeStock++
      negativeStockProducts.push(item)

      return
    }

    if (stock < item.minimumQuantity && stock > 0) {
      lowStock++
      lowStockProducts.push(item)
      return
    }

    if (stock >= item.maximumQuantity) {
      excessStock++
      return
    }

    normalStock++
  })

  return {
    lowStock,
    lowStockProducts,
    normalStock,
    excessStock,
    negativeStock,
    negativeStockProducts,
  }
}
