import { PURCHASE_SHEET_NAME } from "../constants/purchase.constants"

import {
  normalizePurchase,
  purchasesMatch,
} from "../handlers/purchase.handlers"

import type { Purchase } from "../types/purchase.types"

type UpdatePurchaseParams = {
  originalPurchase: Purchase

  updatedPurchase: Purchase

  existingPurchases: Purchase[]

  sheetId: string
}

export async function updatePurchaseService({
  originalPurchase,
  updatedPurchase,
  existingPurchases,
  sheetId,
}: UpdatePurchaseParams): Promise<boolean> {
  const normalizedPurchase = normalizePurchase(updatedPurchase)

  const duplicateExists = existingPurchases.some((purchase) => {
    if (purchasesMatch(purchase, originalPurchase)) {
      return false
    }

    return purchasesMatch(purchase, normalizedPurchase)
  })

  if (duplicateExists) {
    throw new Error("Another purchase already exists")
  }

  const response = await fetch("/api/sheet-rows", {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: PURCHASE_SHEET_NAME,

      sheetId,

      match: {
        product: originalPurchase.product,

        poNumber: originalPurchase.poNumber,
      },

      updates: normalizedPurchase,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to update purchase")
  }

  return true
}
