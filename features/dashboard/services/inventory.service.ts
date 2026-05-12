import { Inventory } from "@/features/inventory/types/inventory.types"

export function getTotalInventoryValue(inventory: Inventory[]) {
  return inventory.reduce((acc, item) => acc + Number(item.value || 0), 0)
}
