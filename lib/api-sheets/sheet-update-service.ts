// lib/api-sheets/sheet-update-service.ts

import { getSheetsClient } from "./google-sheets"

// ─────────────────────────────────────
// Utilities
// ─────────────────────────────────────

function toCamelCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
}

// ─────────────────────────────────────
// Find Matching Rows
// ─────────────────────────────────────

export function findMatchingRows(rows: string[][], match: Record<string, any>) {
  if (rows.length === 0) return []

  const [headers, ...dataRows] = rows

  const normalizedHeaders = headers.map((header) => toCamelCase(header))

  const matchingIndexes: number[] = []

  dataRows.forEach((row, rowIndex) => {
    const rowObject: Record<string, any> = {}

    normalizedHeaders.forEach((header, index) => {
      rowObject[header] = row[index] ?? ""
    })

    const isMatch = Object.entries(match).every(([key, value]) => {
      return String(rowObject[key]) === String(value)
    })

    if (isMatch) {
      // +2 because:
      // row 1 = headers
      // Google Sheets is 1-indexed

      matchingIndexes.push(rowIndex + 2)
    }
  })

  return matchingIndexes
}

// ─────────────────────────────────────
// Update Rows
// ─────────────────────────────────────

type UpdateRowsParams = {
  spreadsheetId: string
  sheetName: string

  headers: string[]

  rowIndexes: number[]

  updates: Record<string, any>
}

export async function updateRows({
  spreadsheetId,
  sheetName,
  headers,
  rowIndexes,
  updates,
}: UpdateRowsParams) {
  const sheets = getSheetsClient()

  const normalizedHeaders = headers.map((header) => ({
    original: header,

    camel: toCamelCase(header),
  }))

  const requests = rowIndexes.flatMap((rowIndex) => {
    return Object.entries(updates)
      .map(([field, value]) => {
        const headerIndex = normalizedHeaders.findIndex(
          (header) => header.camel === field
        )

        if (headerIndex === -1) {
          return null
        }

        const columnLetter = numberToColumnLetter(headerIndex + 1)

        return {
          range: `${sheetName}!${columnLetter}${rowIndex}`,

          values: [[value]],
        }
      })
      .filter(Boolean)
  })

  if (requests.length === 0) {
    return
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,

    requestBody: {
      valueInputOption: "RAW",

      data: requests as any[],
    },
  })
}

// ─────────────────────────────────────
// Column Utility
// ─────────────────────────────────────

function numberToColumnLetter(columnNumber: number) {
  let columnLetter = ""

  while (columnNumber > 0) {
    const modulo = (columnNumber - 1) % 26

    columnLetter = String.fromCharCode(65 + modulo) + columnLetter

    columnNumber = Math.floor((columnNumber - modulo) / 26)
  }

  return columnLetter
}
