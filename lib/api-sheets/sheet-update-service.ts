import { getSheetsClient } from "@/lib/api-sheets/google-sheets"
import { getRawRows } from "@/lib/api-sheets/sheet-delete-service"

// Known header aliases specific to the Inventory sheet.
// Add new mappings here if column names change without touching business logic.
const INVENTORY_COLUMN_ALTERNATIVES: Record<string, string[]> = {
  minimumQuantity: ["Minimum Quantity"],
  maximumQuantity: ["Maximum Quantity"],
  reorderQuantity: ["Reorder Quantity"],
  pricePerUnit: ["Price per Unit"],
}

/**
 * Normalises a cell value to a lowercase trimmed string for loose comparison.
 */
export function normalize(val: any): string {
  return String(val ?? "").toLowerCase().trim()
}

/**
 * Converts a 0-based column index to a spreadsheet column letter (A, B … Z, AA …).
 */
function columnIndexToLetter(index: number): string {
  let letter = ""
  let i = index
  while (i >= 0) {
    letter = String.fromCharCode(65 + (i % 26)) + letter
    i = Math.floor(i / 26) - 1
  }
  return letter
}

/**
 * Resolves a camelCase field name to its column index in the Inventory sheet,
 * trying an exact match, a title-case conversion, and known aliases.
 */
function resolveInventoryColumnIndex(headers: string[], field: string): number {
  // 1. Exact match
  let idx = headers.indexOf(field)
  if (idx !== -1) return idx

  // 2. camelCase → Title Case  (e.g. "pricePerUnit" → "Price Per Unit")
  const titleCase = field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
  idx = headers.indexOf(titleCase)
  if (idx !== -1) return idx

  // 3. Known aliases
  for (const alias of INVENTORY_COLUMN_ALTERNATIVES[field] ?? []) {
    idx = headers.indexOf(alias)
    if (idx !== -1) return idx
  }

  return -1
}

/**
 * Finds the 1-based row index of a product in the Inventory sheet using
 * normalised string comparison, and returns it together with the headers row.
 * Throws if the product or the product column cannot be found.
 */
export async function findInventoryRowIndex(
  spreadsheetId: string,
  productName: string
): Promise<{ rowIndex: number; headers: string[] }> {
  const rows = await getRawRows(spreadsheetId, "Inventory")
  if (rows.length === 0) throw new Error("No inventory data found")

  const headers = rows[0]

  let productColIndex = headers.indexOf("product")
  if (productColIndex === -1) productColIndex = headers.indexOf("Product")
  if (productColIndex === -1) throw new Error("Product column not found in Inventory sheet")

  const target = normalize(productName)

  for (let i = 1; i < rows.length; i++) {
    if (normalize(rows[i][productColIndex]) === target) {
      return { rowIndex: i + 1, headers } // +1 for 1-based sheet indexing
    }
  }

  throw new Error(`Product "${productName}" not found in Inventory sheet`)
}

/**
 * Updates the given fields of a single Inventory row in parallel.
 * Fields whose column cannot be resolved are skipped with a console warning.
 */
export async function updateProductFields(
  spreadsheetId: string,
  rowIndex: number,
  headers: string[],
  updatedProduct: Record<string, any>
): Promise<void> {
  const sheets = getSheetsClient()

  const updates = Object.entries(updatedProduct).flatMap(([field, value]) => {
    const colIndex = resolveInventoryColumnIndex(headers, field)
    if (colIndex === -1) {
      console.warn(`updateProductFields: column not found for field "${field}" — skipping`)
      return []
    }
    return [{ col: columnIndexToLetter(colIndex), value }]
  })

  await Promise.all(
    updates.map(({ col, value }) =>
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Inventory!${col}${rowIndex}`,
        valueInputOption: "RAW",
        requestBody: { values: [[value]] },
      })
    )
  )
}
