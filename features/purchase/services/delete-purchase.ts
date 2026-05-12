import { PURCHASE_SHEET_NAME } from "../constants/purchase.constants"

import type { Purchase } from "../types/purchase.types"

type DeletePurchaseParams = {
  purchase: Purchase

  sheetId: string
}

export async function deletePurchaseService({
  purchase,
  sheetId,
}: DeletePurchaseParams): Promise<boolean> {
  const response = await fetch("/api/sheet-rows", {
    method: "DELETE",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: PURCHASE_SHEET_NAME,

      sheetId,

      items: [purchase],

      matchFields: ["product", "poNumber", "dateOfReceiving"],
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to delete purchase")
  }

  return true
}
