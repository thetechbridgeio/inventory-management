type InventoryItem = Record<string, any>

export const inventoryStore = {
  inventory: [] as InventoryItem[],
  lowStock: [] as InventoryItem[],
  outOfStock: [] as InventoryItem[],
  lastHash: "",
  lastFetched: 0,
}