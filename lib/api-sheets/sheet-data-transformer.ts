/**
 * Domain-specific row transformation for GET responses.
 * Handles numeric coercion, date field preservation, auto-srNo injection,
 * and sheet-specific derived fields (Inventory value, Purchase date alias).
 */

// Headers that should default to 0 when a cell is missing, rather than "".
const NUMERIC_HEADERS = new Set([
  "stock", "Stock",
  "quantity", "Quantity",
  "value", "Value",
  "pricePerUnit", "Price per Unit",
  "minimumQuantity", "Minimum Quantity",
  "maximumQuantity", "Maximum Quantity",
  "reorderQuantity", "Reorder Quantity",
])

const hasSrNoHeader = (headers: string[]) =>
  headers.includes("srNo") || headers.includes("Sr. no")

/**
 * Coerces a single raw cell value to its appropriate JS type.
 * - Date headers are always returned as strings (no coercion).
 * - Numeric strings are converted to numbers.
 * - Missing numeric cells default to 0; all others default to "".
 */
function transformCell(header: string, rawValue: string | undefined): string | number {
  if (rawValue === undefined) {
    return NUMERIC_HEADERS.has(header) ? 0 : ""
  }

  // Preserve date strings as-is — the client handles formatting
  if (header.toLowerCase().includes("date")) return rawValue

  const num = Number(rawValue)
  if (rawValue !== "" && !isNaN(num)) return num

  return rawValue || ""
}

/**
 * Calculates and injects `value` / `Value` for Inventory rows where it is
 * missing but stock and pricePerUnit are present.
 */
function applyInventoryDefaults(item: Record<string, any>): void {
  const stock = item.stock ?? item.Stock
  const price = item.pricePerUnit ?? item["Price per Unit"]
  const hasValue = item.value !== undefined || item.Value !== undefined

  if (stock !== undefined && price !== undefined && !hasValue) {
    item.value = stock * price
    item.Value = stock * price
  }
}

/**
 * Ensures the camelCase alias `dateOfReceiving` is always present on
 * Purchase rows, regardless of which header name the sheet uses.
 */
function applyPurchaseDateMapping(item: Record<string, any>): void {
  if (!item.dateOfReceiving && item["Date of receiving"]) {
    item.dateOfReceiving = item["Date of receiving"]
  }
}

/**
 * Transforms a single raw sheet row into a typed object.
 */
export function transformSheetRow(
  headers: string[],
  row: string[],
  rowIndex: number,
  sheetName: string
): Record<string, any> {
  const item: Record<string, any> = {}

  // Inject a virtual srNo when the sheet doesn't have one
  if (!hasSrNoHeader(headers)) {
    item.srNo = rowIndex + 1
  }

  headers.forEach((header, i) => {
    // For the Purchase "Date of receiving" header, also write the camelCase alias
    if (sheetName === "Purchase" && header === "Date of receiving") {
      const val = row[i] ?? ""
      item[header] = val
      item["dateOfReceiving"] = val
    } else {
      item[header] = transformCell(header, row[i])
    }
  })

  if (sheetName === "Inventory") applyInventoryDefaults(item)
  if (sheetName === "Purchase") applyPurchaseDateMapping(item)

  return item
}

/**
 * Transforms all data rows (excluding the header row) for a given sheet.
 */
export function transformSheetRows(
  headers: string[],
  dataRows: string[][],
  sheetName: string
): Record<string, any>[] {
  return dataRows.map((row, i) => transformSheetRow(headers, row, i, sheetName))
}
