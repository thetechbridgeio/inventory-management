
import { handleApiError } from "@/lib/api-sheets/api-error"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { type NextRequest, NextResponse } from "next/server"

const SHEETS = {
  inventory: "Inventory",
  sales: "Sales",
  purchases: "Purchases",
}


function resolveSpreadsheetId(clientId?: string | null) {
  if (clientId) {
    return process.env.GOOGLE_SHEET_ID
  }
  return process.env.MASTER_SHEET_ID
}

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")
    const spreadsheetId = resolveSpreadsheetId(clientId)

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Sheet ID not configured" },
        { status: 500 }
      )
    }

    const results = await Promise.allSettled([
      getSheetData(spreadsheetId, SHEETS.inventory),
      getSheetData(spreadsheetId, SHEETS.sales),
      getSheetData(spreadsheetId, SHEETS.purchases),
    ])

    const [inventory, sales, purchases] = results.map((result) =>
      result.status === "fulfilled" ? result.value : []
    )

    return NextResponse.json({
      inventory,
      sales,
      purchases,
    })
  } catch (error) {
    return handleApiError(error, "Failed to fetch dashboard data")
  }
}