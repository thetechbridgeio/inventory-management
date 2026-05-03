import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-sheets/api-error"
import { resolveSheetId } from "@/lib/api-sheets/client-service"
import { getRawRows } from "@/lib/api-sheets/sheet-delete-service"
import { getNextSrNo, getSheetHeaders, buildRowData, appendRow } from "@/lib/api-sheets/sheet-append-service"
import { findInventoryRowIndex, updateProductFields } from "@/lib/api-sheets/sheet-update-service"


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sheetName = searchParams.get("sheet") || "Inventory"
    const clientId = searchParams.get("clientId") ?? undefined

    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    const rows = await getRawRows(spreadsheetId, sheetName)
    if (rows.length === 0) return NextResponse.json({ data: [] })

    const [headers, ...dataRows] = rows
    const data = dataRows.map((row) =>
      Object.fromEntries(headers.map((header, i) => [header, row[i] ?? ""]))
    )

    return NextResponse.json({ data })
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch data")
  }
}


export async function POST(request: Request) {
  try {
    const { sheetName, entry, clientId } = await request.json()

    if (!sheetName || !entry) {
      return NextResponse.json(
        { error: "Sheet name and entry are required" },
        { status: 400 }
      )
    }

    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    // Fetch Sr. No and headers in parallel — they're independent calls
    const [nextSrNo, headers] = await Promise.all([
      getNextSrNo(spreadsheetId, sheetName),
      getSheetHeaders(spreadsheetId, sheetName),
    ])

    const rowData = buildRowData(headers, entry, nextSrNo)
    await appendRow(spreadsheetId, sheetName, rowData)

    return NextResponse.json({ success: true, data: { ...entry, srNo: nextSrNo } })
  } catch (error: any) {
    return handleApiError(error, "Failed to add entry")
  }
}



export async function PUT(request: Request) {
  try {
    const { originalProduct, updatedProduct, clientId } = await request.json()

    if (!originalProduct || !updatedProduct) {
      return NextResponse.json(
        { error: "originalProduct and updatedProduct are required" },
        { status: 400 }
      )
    }

    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    const { rowIndex, headers } = await findInventoryRowIndex(spreadsheetId, originalProduct)
    await updateProductFields(spreadsheetId, rowIndex, headers, updatedProduct)

    return NextResponse.json({ success: true, message: "Product updated successfully" })
  } catch (error: any) {
    return handleApiError(error, "Failed to update product")
  }
}