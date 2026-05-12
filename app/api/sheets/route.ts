import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { handleApiError } from "@/lib/api-sheets/api-error"
import { getRawRows } from "@/lib/api-sheets/sheet-read-service"

import {
  getNextSrNo,
  getSheetHeaders,
  buildRowData,
  appendRow,
} from "@/lib/api-sheets/sheet-write-service"

import { transformSheetRows } from "@/lib/api-sheets/sheet-data-transformer"

// ─────────────────────────────────────
// GET
// Generic sheet reader
// ─────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const sheetName = searchParams.get("sheet")
    const sheetId = searchParams.get("sheetId") ?? undefined

    if (!sheetName || !sheetId) {
      return NextResponse.json(
        { error: "Sheet and Sheet ID parameters are required" },
        { status: 400 }
      )
    }

    const rows = await getRawRows(sheetId, sheetName)

    if (rows.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const [headers, ...dataRows] = rows

    const data = transformSheetRows(headers, dataRows, sheetName)

    return NextResponse.json({ data })
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch data")
  }
}

// ─────────────────────────────────────
// POST
// Generic append row
// ─────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { sheetName, entry, sheetId } = await request.json()

    if (!sheetName || !entry || !sheetId) {
      return NextResponse.json(
        {
          error: "sheetName, entry and sheetId are required",
        },
        { status: 400 }
      )
    }

    const [nextSrNo, headers] = await Promise.all([
      getNextSrNo(sheetId, sheetName),

      getSheetHeaders(sheetId, sheetName),
    ])

    if (headers.length === 0) {
      return NextResponse.json(
        {
          error: "No headers found in sheet",
        },
        { status: 404 }
      )
    }

    const rowData = buildRowData(headers, entry, nextSrNo)

    await appendRow(sheetId, sheetName, rowData)

    return NextResponse.json({
      success: true,
      message: `New ${sheetName} entry added successfully`,
      data: {
        srNo: nextSrNo,
        ...entry,
      },
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to add entry")
  }
}
