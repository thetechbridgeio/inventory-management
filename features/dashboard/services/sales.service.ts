import { Inventory } from "@/features/inventory/types/inventory.types"
import { SalesItem } from "@/features/sales/types/sales.types"

export function getTotalSalesValue(sales: SalesItem[], inventory: Inventory[]) {
  return sales.reduce((acc, sale) => {
    const inventoryItem = inventory.find(
      (item) => item.product === sale.product
    )

    const productPrice = inventoryItem?.pricePerUnit || 0

    return acc + Number(sale.quantity) * productPrice
  }, 0)
}
