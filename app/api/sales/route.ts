// app/api/sales/route.ts

import { NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { getSheetsClient } from "@/lib/api-sheets/google-sheets"
import { handleApiError } from "@/lib/api-sheets/api-error"

const SHEET_NAME = "Sales"

const HEADERS = [
  "ID",
  "Date",
  "Customer",
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
    return handleApiError(error, "Failed to fetch sales")
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

    const sale = {
      id: body.id || `sale_${Date.now()}`,
      date: body.date || new Date().toISOString().split("T")[0],
      customer: body.customer ? String(body.customer) : "",
      product: body.product ? String(body.product) : "",
      quantity: quantity.toString(),
      unitPrice: unitPrice.toString(),
      total: body.total
        ? String(body.total)
        : (quantity * unitPrice).toString(),
    }

    if (!sale.product) {
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
          sale.id,
          sale.date,
          sale.customer,
          sale.product,
          sale.quantity,
          sale.unitPrice,
          sale.total,
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Sale added successfully",
      sale,
    })
  } catch (error) {
    return handleApiError(error, "Failed to add sale")
  }
}