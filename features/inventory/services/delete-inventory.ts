import { toast } from "sonner"

import { INVENTORY_SHEET_NAME } from "../constants/inventory.constants"

import { Inventory } from "../types/inventory.types"

type DeleteInventoryParams = {
  inventory: Inventory
  sheetId: string
}

export async function deleteInventoryService({
  inventory,
  sheetId,
}: DeleteInventoryParams): Promise<boolean> {
  toast.loading("Deleting inventory...")

  const response = await fetch("/api/sheet-rows", {
    method: "DELETE",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: INVENTORY_SHEET_NAME,

      sheetId,

      items: [inventory],

      matchFields: ["product", "category", "pricePerUnit"],
    }),
  })

  const result = await response.json()

  toast.dismiss()

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete inventory")
  }

  toast.success("Inventory deleted successfully")

  return true
}
