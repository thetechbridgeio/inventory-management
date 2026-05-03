import { getSheetsClient } from "./google-sheets"

/**
 * Returns the raw 2-D array of values (including the header row) for a sheet.
 * Kept separate from getSheetData() in sheet-service.ts because deletion logic
 * needs raw rows with their original indices, not mapped objects.
 */
export async function getRawRows(spreadsheetId: string, sheetName: string): Promise<string[][]> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  })
  return res.data.values ?? []
}

/**
 * Looks up the internal numeric sheet ID (not the spreadsheet/file ID)
 * for a given sheet tab name.
 */
export async function getSheetTabId(spreadsheetId: string, sheetName: string): Promise<number> {
  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.get({ spreadsheetId })

  const sheet = response.data.sheets?.find(
    (s: any) => s.properties?.title?.toLowerCase() === sheetName.toLowerCase()
  )

  if (!sheet || sheet.properties?.sheetId === undefined) {
    throw new Error(`Sheet tab "${sheetName}" not found in the spreadsheet`)
  }

  return sheet.properties.sheetId
}

/**
 * Deletes the given 1-based row numbers from a sheet.
 * Rows are processed in descending order to avoid index shifting.
 */
export async function deleteRows(
  spreadsheetId: string,
  sheetTabId: number,
  rowNumbers: number[]
): Promise<void> {
  const sheets = getSheetsClient()
  const sorted = [...rowNumbers].sort((a, b) => b - a)

  for (const rowNumber of sorted) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetTabId,
                dimension: "ROWS",
                startIndex: rowNumber - 1, // API is 0-indexed
                endIndex: rowNumber,        // exclusive
              },
            },
          },
        ],
      },
    })
  }
}
