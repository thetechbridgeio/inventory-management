import { PURCHASE_SHEET_NAME } from "../constants/purchase.constants"

import type { Purchase } from "../types/purchase.types"

export async function fetchPurchases(sheetId: string): Promise<Purchase[]> {
  const response = await fetch(
    `/api/sheets?sheet=${PURCHASE_SHEET_NAME}&sheetId=${sheetId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch purchases")
  }

  return result.data || []
}
