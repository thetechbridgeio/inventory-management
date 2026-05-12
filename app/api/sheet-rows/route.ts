import { NextResponse } from "next/server"

import { handleApiError } from "@/lib/api-sheets/api-error"

import {
  getRawRows,
  getSheetTabId,
  deleteRows,
} from "@/lib/api-sheets/sheet-delete-service"

import {
  findMatchingRows,
  updateRows,
} from "@/lib/api-sheets/sheet-update-service"

import { findRowsToDelete } from "@/lib/api-sheets/sheet-row-matcher"

// ─────────────────────────────────────
// PUT
// Generic row updater
// ─────────────────────────────────────

export async function PUT(request: Request) {
  try {
    const { sheetName, match, updates, sheetId } = await request.json()

    if (!sheetName || !match || !updates || !sheetId) {
      return NextResponse.json(
        {
          error: "sheetName, sheetId, match and updates are required",
        },
        { status: 400 }
      )
    }

    const rows = await getRawRows(sheetId, sheetName)

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data found" }, { status: 404 })
    }

    const [headers] = rows

    const matchingRows = findMatchingRows(rows, match)

    if (matchingRows.length === 0) {
      return NextResponse.json(
        {
          error: "No matching rows found",
        },
        { status: 404 }
      )
    }

    await updateRows({
      spreadsheetId: sheetId,
      sheetName,
      headers,
      rowIndexes: matchingRows,
      updates,
    })

    return NextResponse.json({
      success: true,
      message: "Rows updated successfully",
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to update rows")
  }
}

// ─────────────────────────────────────
// DELETE
// Generic row deleter
// ─────────────────────────────────────

export async function DELETE(request: Request) {
  try {
    const { sheetName, items, sheetId, matchFields } = await request.json()

    if (!sheetName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "sheetName and non-empty items array are required",
        },
        { status: 400 }
      )
    }

    const allRows = await getRawRows(sheetId, sheetName)

    if (allRows.length === 0) {
      return NextResponse.json(
        {
          error: "No data found in sheet",
        },
        { status: 404 }
      )
    }

    const rowsToDelete = findRowsToDelete(allRows, items, matchFields)

    if (rowsToDelete.length === 0) {
      return NextResponse.json(
        {
          error: "No matching rows found to delete",
        },
        { status: 404 }
      )
    }

    const sheetTabId = await getSheetTabId(sheetId, sheetName)

    if (sheetTabId === undefined || sheetTabId === null) {
      return NextResponse.json(
        {
          error: "Sheet tab not found",
        },
        { status: 404 }
      )
    }

    await deleteRows(sheetId, sheetTabId, rowsToDelete)

    return NextResponse.json({
      success: true,
      message: `Deleted ${rowsToDelete.length} row(s) successfully`,
    })
  } catch (error: any) {
    return handleApiError(error, "Failed to delete rows")
  }
}
