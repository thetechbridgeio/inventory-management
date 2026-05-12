import { SALES_SHEET_NAME } from "../constants/sales.constants"

import { SalesItem } from "../types/sales.types"

type FetchSalesParams = {
  sheetId: string
}

type FetchSalesResponse = {
  data: SalesItem[]
}

export async function fetchSales({
  sheetId,
}: FetchSalesParams): Promise<SalesItem[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/sheets?sheet=${SALES_SHEET_NAME}&sheetId=${sheetId}`,
    {
      method: "GET",
      cache: "no-store",
    }
  )

  const result: FetchSalesResponse & {
    error?: string
  } = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch sales")
  }

  return result.data || []
}
