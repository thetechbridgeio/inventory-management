import { getSheetsClient } from "./google-sheets"


const HEADER_FIELD_OVERRIDES: Record<string, string> = {
  "rack number/location of stock": "rackNumber",
  "location of stock": "rackNumber",
  "rack number": "rackNumber",
  "date of receiving": "dateOfReceiving",
  "date of issue": "dateOfIssue",
}

/**
 * Determines the next Sr. No by scanning column A of the sheet.
 * Returns 1 if the sheet is empty or doesn't use a Sr. No column.
 */
export async function getNextSrNo(spreadsheetId: string, sheetName: string): Promise<number> {
  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  })

  const rows: string[][] = response.data.values ?? []
  if (rows.length <= 1) return 1

  const header = rows[0][0]
  if (header !== "Sr. no" && header !== "srNo") return 1

  const srNos = rows.slice(1).map((row) => parseInt(row[0]) || 0)
  return Math.max(...srNos, 0) + 1
}

/**
 * Fetches the header row for a sheet.
 */
export async function getSheetHeaders(spreadsheetId: string, sheetName: string): Promise<string[]> {
  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  })
  return response.data.values?.[0] ?? []
}

/**
 * Resolves a sheet header string to its corresponding entry field name.
 * Tries HEADER_FIELD_OVERRIDES first, then falls back to camelCase conversion.
 */
function headerToFieldKey(header: string): string {
  const lower = header.toLowerCase()
  if (HEADER_FIELD_OVERRIDES[lower]) return HEADER_FIELD_OVERRIDES[lower]
  return lower.replace(/\s(.)/g, (_, c: string) => c.toUpperCase())
}

/**
 * Maps an entry object to an ordered array of cell values based on the sheet headers.
 * Sr. No columns are automatically populated with nextSrNo.
 * Timestamp columns are populated with the current ISO timestamp.
 */
export function buildRowData(
  headers: string[],
  entry: Record<string, any>,
  nextSrNo: number
): string[] {
  return headers.map((header) => {
    const lower = header.toLowerCase()

    if (lower === "sr. no" || lower === "srno" || lower === "sr no") {
      return String(nextSrNo)
    }

    if (lower === "timestamp") {
      return new Date().toISOString()
    }

    const key = headerToFieldKey(header)
    return entry[key] !== undefined ? String(entry[key]) : ""
  })
}

/**
 * Appends a single row to the specified sheet.
 */
export async function appendRow(
  spreadsheetId: string,
  sheetName: string,
  rowData: string[]
): Promise<void> {
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [rowData] },
  })
}