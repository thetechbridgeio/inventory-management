// app/api/purchases/route.ts

import { NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { getSheetsClient } from "@/lib/api-sheets/google-sheets"
import { handleApiError } from "@/lib/api-sheets/api-error"

const SHEET_NAME = "Purchases"

const HEADERS = [
  "ID",
  "Date",
  "Supplier",
  "Product",
  "Quantity",
  "Unit Price",
  "Total",
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
    return handleApiError(error, "Failed to fetch purchases")
  }
}

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
    const quantity = Number(body.quantity || 0)
    const unitPrice = Number(body.unitPrice || 0)

    const purchase = {
      id: body.id || `purchase_${Date.now()}`,
      date: body.date || new Date().toISOString().split("T")[0],
      supplier: body.supplier ? String(body.supplier) : "",
      product: body.product ? String(body.product) : "",
      quantity: quantity.toString(),
      unitPrice: unitPrice.toString(),
      total: body.total
        ? String(body.total)
        : (quantity * unitPrice).toString(),
    }

    if (!purchase.product) {
      return NextResponse.json(
        { error: "Product is required" },
        { status: 400 }
      )
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          purchase.id,
          purchase.date,
          purchase.supplier,
          purchase.product,
          purchase.quantity,
          purchase.unitPrice,
          purchase.total,
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Purchase added successfully",
      purchase,
    })
  } catch (error) {
    return handleApiError(error, "Failed to add purchase")
  }
}