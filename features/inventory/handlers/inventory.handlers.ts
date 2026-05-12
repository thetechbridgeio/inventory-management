import { Inventory } from "../types/inventory.types"

export function normalizeInventory(inventory: Inventory): Inventory {
  const stock = Number(inventory.stock)

  const pricePerUnit = Number(inventory.pricePerUnit)

  return {
    ...inventory,

    product: inventory.product.trim(),

    category: inventory.category.trim(),

    unit: inventory.unit.trim(),

    minimumQuantity: Number(inventory.minimumQuantity),

    maximumQuantity: Number(inventory.maximumQuantity),

    reorderQuantity: Number(inventory.reorderQuantity),

    stock,

    pricePerUnit,

    value: stock * pricePerUnit,

    location: inventory.location?.trim() || "",

    openingStock: inventory.openingStock || 0,

    timestamp: inventory.timestamp || new Date().toISOString(),
  }
}

export function inventoriesMatch(inventoryA: Inventory, inventoryB: Inventory) {
  return (
    inventoryA.product.trim().toLowerCase() ===
      inventoryB.product.trim().toLowerCase() &&
    inventoryA.category.trim().toLowerCase() ===
      inventoryB.category.trim().toLowerCase()
  )
}

export function inventoryExists(
  inventories: Inventory[],
  targetInventory: Inventory
) {
  return inventories.some((inventory) =>
    inventoriesMatch(inventory, targetInventory)
  )
}

export function getTotalStockValue(inventories: Inventory[]) {
  return inventories.reduce(
    (total, inventory) => total + Number(inventory.value || 0),
    0
  )
}

export function getTotalStock(inventories: Inventory[]) {
  return inventories.reduce(
    (total, inventory) => total + Number(inventory.stock || 0),
    0
  )
}
