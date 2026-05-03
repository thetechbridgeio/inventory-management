// app/api/inventory/route.ts

import { NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { handleApiError } from "@/lib/api-sheets/api-error"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { getSheetsClient } from "@/lib/api-sheets/google-sheets"

const SHEET_NAME = "Inventory"

const HEADERS = [
  "ID",
  "Name",
  "Category",
  "Quantity",
  "Unit Price",
]

export async function GET(request: Request) {
  try {
    const sheetId = await getSheetId(request)

    if (!sheetId) {
      return NextResponse.json(
        { error: "No sheet ID available. Please select a client or check configuration." },
        { status: 400 }
      )
    }

    const data = await getSheetData(sheetId, SHEET_NAME)

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error, "Failed to fetch inventory")
  }
}

// ✅ ADD Inventory Item
export async function POST(request: Request) {
  try {
    const sheetId = await getSheetId(request)
    const body = await request.json()

    if (!sheetId) {
      return NextResponse.json(
        { error: "No sheet ID available. Please select a client or check configuration." },
        { status: 400 }
      )
    }

    await ensureSheetExists(sheetId, SHEET_NAME, HEADERS)

    const sheets = getSheetsClient()

    const item = {
      id: body.id || `item_${Date.now()}`,
      name: String(body.name || ""),
      category: body.category ? String(body.category) : "",
      quantity: body.quantity ? String(body.quantity) : "0",
      unitPrice: body.unitPrice ? String(body.unitPrice) : "0",
    }

    if (!item.name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      )
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:E`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          item.id,
          item.name,
          item.category,
          item.quantity,
          item.unitPrice,
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Inventory item added successfully",
      item,
    })
  } catch (error) {
    return handleApiError(error, "Failed to add inventory item")
  }
}