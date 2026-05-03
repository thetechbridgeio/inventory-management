import { getSheetsClient } from "./google-sheets"

export async function getSheetData(sheetId: string, sheetName: string) {
  const sheets = getSheetsClient()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:Z`,
  })

  const rows = res.data.values || []
  if (rows.length === 0) return []

  const headers = rows[0]

  return rows.slice(1).map((row: any[]) => {
    const obj: Record<string, any> = {}

    headers.forEach((header: string, i: number) => {
      const key = header.toLowerCase().replace(/\s(.)/g, (_, c) => c.toUpperCase())
      obj[key] = row[i] || ""
    })

    return obj
  })
}