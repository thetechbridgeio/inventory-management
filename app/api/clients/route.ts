// app/api/clients/route.ts

import { NextResponse } from "next/server"
import { getSheetsClient } from "@/lib/api-sheets/google-sheets"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { ensureSheetExists } from "@/lib/api-sheets/sheet-validator"
import { handleApiError } from "@/lib/api-sheets/api-error"

const SHEET_NAME = "Clients"

const HEADERS = [
  "ID",
  "Name",
  "Email",
  "Phone",
  "Logo URL",
  "Sheet ID",
  "Username",
  "Password",
  "Super Admin Email",
]

export async function GET() {
  try {
    const spreadsheetId =
      process.env.MASTER_SHEET_ID || process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Master Sheet ID not configured" },
        { status: 500 }
      )
    }

    const data = await getSheetData(spreadsheetId, SHEET_NAME)

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error, "Failed to fetch clients")
  }
}

export async function POST(request: Request) {
  try {
    const { client } = await request.json()

    if (!client || !client.name || !client.email) {
      return NextResponse.json(
        { error: "Client name and email are required" },
        { status: 400 }
      )
    }

    const spreadsheetId =
      process.env.MASTER_SHEET_ID || process.env.GOOGLE_SHEET_ID

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Master Sheet ID not configured" },
        { status: 500 }
      )
    }

    // ✅ Ensure sheet + headers exist (no manual logic anymore)
    await ensureSheetExists(spreadsheetId, SHEET_NAME, HEADERS)

    const sheets = getSheetsClient()

    // ✅ Normalize + enforce types
    const normalizedClient = {
      id: client.id || `client_${Date.now()}`,
      name: String(client.name || ""),
      email: String(client.email || ""),
      phone: client.phone ? String(client.phone) : "",
      logoUrl: client.logoUrl ? String(client.logoUrl) : "",
      sheetId: client.sheetId ? String(client.sheetId) : "",
      username:
        client.username ||
        String(client.name).replace(/\s+/g, "").toLowerCase(),
      password:
        client.password ||
        `${String(client.name).replace(/\s+/g, "").toLowerCase()}@123`,
      superAdminEmail: client.superAdminEmail
        ? String(client.superAdminEmail)
        : "",
    }

    // ⚠️ subtle bug you had: range was A:H but 9 columns were being inserted
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:I`, // FIXED
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          normalizedClient.id,
          normalizedClient.name,
          normalizedClient.email,
          normalizedClient.phone,
          normalizedClient.logoUrl,
          normalizedClient.sheetId,
          normalizedClient.username,
          normalizedClient.password,
          normalizedClient.superAdminEmail,
        ]],
      },
    })

    return NextResponse.json({
      success: true,
      message: "Client added successfully",
      client: normalizedClient,
    })
  } catch (error) {
    return handleApiError(error, "Failed to add client")
  }
}