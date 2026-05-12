import { toast } from "sonner"

import { SALES_SHEET_NAME } from "../constants/sales.constants"

import { normalizeSalesItem, salesItemExists } from "../handlers/sales.handlers"

import { SalesItem } from "../types/sales.types"

type CreateSalesParams = {
  sales: SalesItem[]
  salesItem: SalesItem
  sheetId: string
}

export async function createSales({
  sales,
  salesItem,
  sheetId,
}: CreateSalesParams): Promise<void> {
  const normalizedSales = normalizeSalesItem(salesItem)

  const alreadyExists = salesItemExists(sales, normalizedSales)

  if (alreadyExists) {
    throw new Error("Sales item already exists")
  }

  const loadingToast = toast.loading("Adding sales item...")

  try {
    const response = await fetch("/api/sheets", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        sheetName: SALES_SHEET_NAME,

        sheetId,

        entry: normalizedSales,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to add sales item")
    }
  } finally {
    toast.dismiss(loadingToast)
  }
}
