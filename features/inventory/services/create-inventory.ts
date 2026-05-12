import { toast } from "sonner"

import { INVENTORY_SHEET_NAME } from "../constants/inventory.constants"

import {
  inventoryExists,
  normalizeInventory,
} from "../handlers/inventory.handlers"

import { Inventory } from "../types/inventory.types"

type CreateInventoryParams = {
  inventory: Inventory
  existingInventory: Inventory[]
  sheetId: string
}

export async function createInventoryService({
  inventory,
  existingInventory,
  sheetId,
}: CreateInventoryParams): Promise<boolean> {
  const normalizedInventory = normalizeInventory(inventory)

  const alreadyExists = inventoryExists(existingInventory, normalizedInventory)

  if (alreadyExists) {
    toast.error("Inventory already exists")

    return false
  }

  toast.loading("Adding inventory...")

  const response = await fetch("/api/sheets", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: INVENTORY_SHEET_NAME,

      sheetId,

      entry: normalizedInventory,
    }),
  })

  const result = await response.json()

  toast.dismiss()

  if (!response.ok) {
    throw new Error(result.error || "Failed to add inventory")
  }

  toast.success("Inventory added successfully")

  return true
}
