// app/api/vendors/route.ts

import { NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { handleApiError } from "@/lib/api-sheets/api-error"
import { getSheetsClient } from "@/lib/api-sheets/google-sheets"

const SHEET_NAME = "Vendors"
const HEADERS = ["Vendor Name", "Email", "Phone", "Note"]


export async function GET(request: Request) {
    try {
        const sheetId = await getSheetId(request)

        if (!sheetId) {
            return NextResponse.json({ error: "No sheet ID found" }, { status: 400 })
        }

        const data = await getSheetData(sheetId, SHEET_NAME)

        return NextResponse.json({ data })
    } catch (error) {
        return handleApiError(error, "Failed to fetch vendors")
    }
}


export async function POST(request: Request) {
    try {
        const sheetId = await getSheetId(request)
        const body = await request.json()

        if (!sheetId) {
            return NextResponse.json({ error: "No sheet ID found" }, { status: 400 })
        }


        await ensureSheetExists(sheetId, SHEET_NAME, HEADERS)

        const sheets = getSheetsClient()


        const vendor = {
            vendorName: String(body.vendorName || ""),
            email: body.email ? String(body.email) : "",
            phone: body.phone ? String(body.phone) : "",
            note: body.note ? String(body.note) : "",
        }

        if (!vendor.vendorName) {
            return NextResponse.json(
                { error: "Vendor name is required" },
                { status: 400 }
            )
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${SHEET_NAME}!A:D`,
            valueInputOption: "RAW",
            requestBody: {
                values: [[
                    vendor.vendorName,
                    vendor.email,
                    vendor.phone,
                    vendor.note,
                ]],
            },
        })

        return NextResponse.json({
            success: true,
            vendor,
        })
    } catch (error) {
        return handleApiError(error, "Failed to create vendor")
    }
}