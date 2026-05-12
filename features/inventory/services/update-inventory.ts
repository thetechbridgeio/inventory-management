import { toast } from "sonner"

import { INVENTORY_SHEET_NAME } from "../constants/inventory.constants"

import {
  inventoriesMatch,
  normalizeInventory,
} from "../handlers/inventory.handlers"

import { Inventory } from "../types/inventory.types"

type UpdateInventoryParams = {
  originalInventory: Inventory
  updatedInventory: Inventory
  existingInventory: Inventory[]
  sheetId: string
}

export async function updateInventoryService({
  originalInventory,
  updatedInventory,
  existingInventory,
  sheetId,
}: UpdateInventoryParams): Promise<boolean> {
  const normalizedInventory = normalizeInventory(updatedInventory)

  const duplicateExists = existingInventory.some((inventoryItem) => {
    if (inventoriesMatch(inventoryItem, originalInventory)) {
      return false
    }

    return inventoriesMatch(inventoryItem, normalizedInventory)
  })

  if (duplicateExists) {
    toast.error("Another inventory already exists")

    return false
  }

  toast.loading("Updating inventory...")

  const response = await fetch("/api/sheet-rows", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: INVENTORY_SHEET_NAME,

      sheetId,

      match: {
        product: originalInventory.product,

        category: originalInventory.category,
      },

      updates: normalizedInventory,
    }),
  })

  const result = await response.json()

  toast.dismiss()

  if (!response.ok) {
    throw new Error(result.error || "Failed to update inventory")
  }

  toast.success("Inventory updated successfully")

  return true
}
