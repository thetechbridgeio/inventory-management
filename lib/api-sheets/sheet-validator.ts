import { getSheetsClient } from "./google-sheets"

export async function ensureSheetExists(
  sheetId: string,
  sheetName: string,
  headers: string[]
) {
  const sheets = getSheetsClient()

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId })

  const exists = spreadsheet.data.sheets?.some(
    (s: any) => s.properties?.title === sheetName
  )

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: sheetName } } },
        ],
      },
    })

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    })
  }
}