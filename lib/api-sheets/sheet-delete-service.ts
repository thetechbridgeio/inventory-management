// lib/api-sheets/sheet-delete-service.ts

import { getSheetsClient } from "./google-sheets"

// ─────────────────────────────────────
// Read Raw Rows
// ─────────────────────────────────────

export async function getRawRows(spreadsheetId: string, sheetName: string) {
  const sheets = getSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  })

  return response.data.values || []
}

// ─────────────────────────────────────
// Get Sheet Tab ID
// ─────────────────────────────────────

export async function getSheetTabId(spreadsheetId: string, sheetName: string) {
  const sheets = getSheetsClient()

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  })

  const targetSheet = response.data.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName
  )

  if (targetSheet?.properties?.sheetId === undefined) {
    throw new Error(`Sheet "${sheetName}" not found`)
  }

  return targetSheet.properties.sheetId
}

// ─────────────────────────────────────
// Delete Rows
// ─────────────────────────────────────

export async function deleteRows(
  spreadsheetId: string,
  sheetTabId: number,
  rowIndexes: number[]
) {
  const sheets = getSheetsClient()

  // IMPORTANT:
  // delete bottom-up to prevent shifting

  const sortedIndexes = [...rowIndexes].sort((a, b) => b - a)

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,

    requestBody: {
      requests: sortedIndexes.map((rowIndex) => ({
        deleteDimension: {
          range: {
            sheetId: sheetTabId,

            dimension: "ROWS",

            startIndex: rowIndex - 1,

            endIndex: rowIndex,
          },
        },
      })),
    },
  })
}
