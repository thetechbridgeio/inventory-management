import { Inventory } from "@/features/inventory/types/inventory.types"
import { Purchase } from "@/features/purchase/types/purchase.types"

export function getTotalPurchaseValue(
  purchases: Purchase[],
  inventory: Inventory[]
) {
  return purchases.reduce((acc, purchase) => {
    const inventoryItem = inventory.find(
      (item) => item.product === purchase.product
    )

    const productPrice = inventoryItem?.pricePerUnit || 0

    return acc + Number(purchase.quantity) * productPrice
  }, 0)
}
