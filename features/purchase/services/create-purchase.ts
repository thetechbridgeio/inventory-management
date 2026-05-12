import { PURCHASE_SHEET_NAME } from "../constants/purchase.constants"

import {
  normalizePurchase,
  purchaseExists,
} from "../handlers/purchase.handlers"

import type { Purchase } from "../types/purchase.types"

type CreatePurchaseParams = {
  purchase: Purchase

  existingPurchases: Purchase[]

  sheetId: string
}

export async function createPurchaseService({
  purchase,
  existingPurchases,
  sheetId,
}: CreatePurchaseParams): Promise<boolean> {
  const normalizedPurchase = normalizePurchase(purchase)

  const alreadyExists = purchaseExists(existingPurchases, normalizedPurchase)

  if (alreadyExists) {
    throw new Error("Purchase already exists")
  }

  const response = await fetch("/api/sheets", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      sheetName: PURCHASE_SHEET_NAME,

      sheetId,

      entry: normalizedPurchase,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to add purchase")
  }

  return true
}
