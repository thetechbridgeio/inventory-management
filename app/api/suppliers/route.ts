// app/api/suppliers/route.ts
import { NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { handleApiError } from "@/lib/api-sheets/api-error"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { getSheetsClient } from "@/lib/api-sheets/google-sheets"


export async function GET(request: Request) {
  try {
    const sheetId = await getSheetId(request)
    if (!sheetId) {
      return NextResponse.json({ error: "No sheet ID" }, { status: 400 })
    }

    const data = await getSheetData(sheetId, "Suppliers")

    return NextResponse.json({ data })
  } catch (err) {
    return handleApiError(err, "Failed to fetch suppliers")
  }
}

export async function POST(request: Request) {
  try {
    const sheetId = await getSheetId(request)
    const body = await request.json()

    if (!sheetId) {
      return NextResponse.json({ error: "No sheet ID" }, { status: 400 })
    }

    await ensureSheetExists(sheetId, "Suppliers", [
      "ID",
      "Name",
      "Contact",
      "Email",
      "Address",
    ])

    const sheets = getSheetsClient()

    const newSupplier = {
      id: body.id || `supplier_${Date.now()}`,
      name: body.name || "",
      contact: body.contact || "",
      email: body.email || "",
      address: body.address || "",
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Suppliers!A:E",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          newSupplier.id,
          newSupplier.name,
          newSupplier.contact,
          newSupplier.email,
          newSupplier.address,
        ]],
      },
    })

    return NextResponse.json({ success: true, supplier: newSupplier })
  } catch (err) {
    return handleApiError(err, "Failed to add supplier")
  }
}