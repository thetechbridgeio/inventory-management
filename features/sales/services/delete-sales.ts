import { toast } from "sonner"

import { SALES_SHEET_NAME } from "../constants/sales.constants"

import { SalesItem } from "../types/sales.types"

type DeleteSalesParams = {
  salesItem: SalesItem
  sheetId: string
}

export async function deleteSales({
  salesItem,
  sheetId,
}: DeleteSalesParams): Promise<void> {
  const loadingToast = toast.loading("Deleting sales item...")

  try {
    const response = await fetch("/api/sheet-rows", {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        sheetName: SALES_SHEET_NAME,

        sheetId,

        items: [salesItem],

        matchFields: ["product", "companyName"],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete sales item")
    }
  } finally {
    toast.dismiss(loadingToast)
  }
}
