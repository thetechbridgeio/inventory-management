import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-sheets/api-error"
import { resolveSheetId } from "@/lib/api-sheets/client-service"
import { findRowsToDelete } from "@/lib/api-sheets/sheet-row-matcher"
import { getRawRows, getSheetTabId, deleteRows } from "@/lib/api-sheets/sheet-delete-service"

type DeleteRequestBody = {
  sheetName: string
  items: Record<string, any>[]
  clientId?: string
}

export async function POST(request: Request) {
  try {
    const body: DeleteRequestBody = await request.json()
    const { sheetName, items, clientId } = body

    if (!sheetName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'sheetName' and a non-empty 'items' array are required." },
        { status: 400 }
      )
    }

    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    const allRows = await getRawRows(spreadsheetId, sheetName)
    if (allRows.length === 0) {
      return NextResponse.json({ error: "No data found in the sheet" }, { status: 404 })
    }

    const rowsToDelete = findRowsToDelete(allRows, items, sheetName)
    if (rowsToDelete.length === 0) {
      return NextResponse.json({ error: "No matching rows found to delete" }, { status: 404 })
    }

    const sheetTabId = await getSheetTabId(spreadsheetId, sheetName)
    await deleteRows(spreadsheetId, sheetTabId, rowsToDelete)

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${rowsToDelete.length} row(s) from "${sheetName}"`,
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to delete rows")
  }
}