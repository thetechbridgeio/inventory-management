// lib/api-sheets/sheet-write-service.ts

import { getSheetsClient } from "./google-sheets"

export async function getSheetHeaders(
  spreadsheetId: string,
  sheetName: string
) {
  const sheets = getSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  })

  return response.data.values?.[0] || []
}

export async function getNextSrNo(spreadsheetId: string, sheetName: string) {
  const sheets = getSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  })

  const rows = response.data.values || []

  return rows.length
}

export function buildRowData(
  headers: string[],
  entry: Record<string, any>,
  srNo: number
) {
  return headers.map((header) => {
    // Support common primary key fields

    if (header === "Sr No" || header === "SR NO" || header === "srNo") {
      return srNo
    }

    // Convert Header Name -> camelCase
    // Example:
    // "Company Name" -> "companyName"

    const key = header
      .toLowerCase()
      .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())

    return entry[key] ?? ""
  })
}

export async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  rowData: any[]
) {
  const sheets = getSheetsClient()

  await sheets.spreadsheets.values.append({
    spreadsheetId,

    range: sheetName,

    valueInputOption: "RAW",

    requestBody: {
      values: [rowData],
    },
  })
}
