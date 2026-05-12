// lib/api-sheets/sheet-read-service.ts

import { getSheetsClient } from "./google-sheets"

export async function getRawRows(spreadsheetId: string, sheetName: string) {
  const sheets = getSheetsClient()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  })

  return response.data.values || []
}
