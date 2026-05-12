import { INVENTORY_SHEET_NAME } from "../constants/inventory.constants"

import { Inventory } from "../types/inventory.types"

export async function fetchInventory(sheetId: string): Promise<Inventory[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/sheets?sheet=${INVENTORY_SHEET_NAME}&sheetId=${sheetId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch inventory")
  }

  return result.data || []
}
