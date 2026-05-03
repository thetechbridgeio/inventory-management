import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { handleApiError } from "@/lib/api-sheets/api-error"
import { resolveSheetId } from "@/lib/api-sheets/client-service"
import { getRawRows } from "@/lib/api-sheets/sheet-delete-service"
import { transformSheetRows } from "@/lib/api-sheets/sheet-data-transformer"
import { getNextSrNo, getSheetHeaders, buildRowData, appendRow } from "@/lib/api-sheets/sheet-append-service"
import { findInventoryRowIndex, updateProductFields } from "@/lib/api-sheets/sheet-update-service"

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const sheetName = searchParams.get("sheet")
  const clientId = searchParams.get("clientId") ?? undefined

  if (!sheetName) {
    return NextResponse.json({ error: "Sheet parameter is required" }, { status: 400 })
  }

  try {
    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    const rows = await getRawRows(spreadsheetId, sheetName)
    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    const [headers, ...dataRows] = rows
    const data = transformSheetRows(headers, dataRows, sheetName)

    return NextResponse.json({ data })
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch data")
  }
}

// ─── PUT ──────────────────────────────────────────────────────────────────────
// Updates stock and value for a specific inventory product.

export async function PUT(request: Request) {
  try {
    const { product, newStock, newValue, clientId } = await request.json()

    if (!product || newStock === undefined || newValue === undefined) {
      return NextResponse.json(
        { error: "product, newStock, and newValue are required" },
        { status: 400 }
      )
    }

    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    const { rowIndex, headers } = await findInventoryRowIndex(spreadsheetId, product)
    await updateProductFields(spreadsheetId, rowIndex, headers, {
      stock: newStock,
      value: newValue,
    })

    return NextResponse.json({ success: true, message: "Inventory updated successfully" })
  } catch (error: any) {
    return handleApiError(error, "Failed to update data")
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────
// Appends a new entry to any sheet.

export async function POST(request: Request) {
  try {
    const { sheetName, entry, clientId } = await request.json()

    if (!sheetName || !entry) {
      return NextResponse.json(
        { error: "sheetName and entry are required" },
        { status: 400 }
      )
    }

    const spreadsheetId = await resolveSheetId(clientId)
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 })
    }

    const [nextSrNo, headers] = await Promise.all([
      getNextSrNo(spreadsheetId, sheetName),
      getSheetHeaders(spreadsheetId, sheetName),
    ])

    if (headers.length === 0) {
      return NextResponse.json({ error: "No headers found in sheet" }, { status: 404 })
    }

    const rowData = buildRowData(headers, entry, nextSrNo)
    await appendRow(spreadsheetId, sheetName, rowData)

    return NextResponse.json({
      success: true,
      message: `New ${sheetName} entry added successfully`,
      data: { srNo: nextSrNo, ...entry },
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to add entry")
  }
}