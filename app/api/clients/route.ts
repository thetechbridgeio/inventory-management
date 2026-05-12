import { NextResponse } from "next/server"

import { handleApiError } from "@/lib/api-sheets/api-error"

import { getRawRows } from "@/lib/api-sheets/sheet-read-service"

import { appendRow, buildRowData } from "@/lib/api-sheets/sheet-write-service"

import {
  CLIENTS_SHEET_NAME,
  CLIENT_HEADERS,
} from "@/features/clients/constants/client.constants"

import { transformSheetRows } from "@/lib/api-sheets/sheet-data-transformer"

const MASTER_SHEET_ID = process.env.MASTER_SHEET_ID

// ─────────────────────────────────────
// GET CLIENTS
// ─────────────────────────────────────

// ─────────────────────────────────────
// GET CLIENTS
// ─────────────────────────────────────

export async function GET(request: Request) {
  try {
    if (!MASTER_SHEET_ID) {
      return NextResponse.json(
        {
          error: "MASTER_SHEET_ID not configured",
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)

    const clientId = searchParams.get("id")

    const rows = await getRawRows(MASTER_SHEET_ID, CLIENTS_SHEET_NAME)

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const [headers, ...dataRows] = rows

    const data = transformSheetRows(headers, dataRows)

    // ─────────────────────────────────
    // FETCH SINGLE CLIENT
    // ─────────────────────────────────

    if (clientId) {
      const client = data.find((item: any) => item.id === clientId)

      if (!client) {
        return NextResponse.json(
          {
            error: "Client not found",
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: client,
      })
    }

    // ─────────────────────────────────
    // FETCH ALL CLIENTS
    // ─────────────────────────────────

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch clients")
  }
}

// ─────────────────────────────────────
// CREATE CLIENT
// ─────────────────────────────────────

export async function POST(request: Request) {
  try {
    if (!MASTER_SHEET_ID) {
      return NextResponse.json(
        {
          error: "MASTER_SHEET_ID not configured",
        },
        { status: 500 }
      )
    }

    const { client } = await request.json()

    if (!client) {
      return NextResponse.json(
        {
          error: "Client payload is required",
        },
        { status: 400 }
      )
    }

    const rowData = buildRowData(CLIENT_HEADERS, client, 0)

    console.log("Appending row data:", rowData)

    await appendRow(MASTER_SHEET_ID, CLIENTS_SHEET_NAME, rowData)

    return NextResponse.json({
      success: true,

      message: "Client created successfully",

      data: client,
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to create client")
  }
}
