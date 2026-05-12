import { toast } from "sonner"

import { SALES_SHEET_NAME } from "../constants/sales.constants"

import { normalizeSalesItem, salesItemsMatch } from "../handlers/sales.handlers"

import { SalesItem } from "../types/sales.types"

type UpdateSalesParams = {
  sales: SalesItem[]
  originalSales: SalesItem
  updatedSales: SalesItem
  sheetId: string
}

export async function updateSales({
  sales,
  originalSales,
  updatedSales,
  sheetId,
}: UpdateSalesParams): Promise<void> {
  const normalizedSales = normalizeSalesItem(updatedSales)

  const duplicateExists = sales.some((salesItem) => {
    if (salesItemsMatch(salesItem, originalSales)) {
      return false
    }

    return salesItemsMatch(salesItem, normalizedSales)
  })

  if (duplicateExists) {
    throw new Error("Another sales item already exists")
  }

  const loadingToast = toast.loading("Updating sales item...")

  try {
    const response = await fetch("/api/sheet-rows", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        sheetName: SALES_SHEET_NAME,

        sheetId,

        match: {
          product: originalSales.product,

          companyName: originalSales.companyName,

          dateOfIssue: originalSales.dateOfIssue,
        },

        updates: normalizedSales,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to update sales item")
    }
  } finally {
    toast.dismiss(loadingToast)
  }
}
