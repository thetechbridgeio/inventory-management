
import { getSheetsClient } from "./google-sheets"

type SheetItem = Record<string, any>


export async function resolveSheetId(clientId?: string): Promise<string> {
  const defaultSheetId = process.env.GOOGLE_SHEET_ID ?? ""

  if (!clientId) return defaultSheetId

  try {
    const clientData = await fetchClientData(clientId)
    if (clientData?.sheetId) {
      console.log(`Using client-specific sheet ID for client ${clientId}: ${clientData.sheetId}`)
      return clientData.sheetId
    }
  } catch (err) {
    console.error("Error fetching client sheet ID, falling back to default:", err)
  }

  return defaultSheetId
}


export async function fetchClientData(clientId: string): Promise<SheetItem | null> {
  const masterSheetId = process.env.MASTER_SHEET_ID
  if (!masterSheetId) throw new Error("MASTER_SHEET_ID is not set in environment variables")

  const sheets = getSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: masterSheetId,
    range: "Clients!A:F",
  })

  const rows: string[][] = response.data.values ?? []
  if (rows.length <= 1) return null

  const [headerRow, ...dataRows] = rows

  for (const row of dataRows) {
    if (row[0] !== clientId) continue

    return Object.fromEntries(
      headerRow.map((header, i) => {
        const key = header.toLowerCase().replace(/\s(.)/g, (_, c: string) => c.toUpperCase())
        return [key, row[i] ?? ""]
      })
    )
  }

  return null
}
