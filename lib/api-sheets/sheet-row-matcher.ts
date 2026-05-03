type SheetItem = Record<string, any>

const FIELDS_TO_MATCH = [
  "product",
  "quantity",
  "dateOfReceiving",
  "dateOfIssue",
  "supplier",
  "companyName",
  "contact",
] as const

const DATE_FIELDS = new Set(["dateOfReceiving", "dateOfIssue"])
const NUMERIC_FIELDS = new Set(["quantity"])

const COLUMN_ALTERNATIVES: Record<string, string[]> = {
  dateOfReceiving: ["Date of receiving", "DateOfReceiving"],
  dateOfIssue: ["Date of Issue", "DateOfIssue"],
}


export function resolveColumnIndex(headers: string[], field: string): number {
  const candidates = [
    field,
    field.charAt(0).toUpperCase() + field.slice(1),
    ...(COLUMN_ALTERNATIVES[field] ?? []),
  ]

  for (const candidate of candidates) {
    const idx = headers.indexOf(candidate)
    if (idx !== -1) return idx
  }

  return -1
}


export function toISODate(value: string): string | null {
  try {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0]
  } catch {
    return null
  }
}


export function rowMatchesItem(
  row: string[],
  item: SheetItem,
  fieldIndices: Record<string, number>
): boolean {
  for (const [field, colIndex] of Object.entries(fieldIndices)) {
    if (item[field] === undefined || row[colIndex] === undefined) continue

    const itemVal = String(item[field]).trim()
    const rowVal = String(row[colIndex]).trim()

    if (DATE_FIELDS.has(field)) {
      const a = toISODate(itemVal)
      const b = toISODate(rowVal)
      if (a !== null && b !== null && a !== b) return false
      continue
    }

    if (NUMERIC_FIELDS.has(field)) {
      const a = Number(itemVal)
      const b = Number(rowVal)
      if (!isNaN(a) && !isNaN(b) && a !== b) return false
      continue
    }

    if (itemVal !== rowVal) return false
  }

  return true
}


export function findRowsToDelete(
  rows: string[][],
  items: SheetItem[],
  sheetName: string
): number[] {
  const [headers, ...dataRows] = rows
  const matched: number[] = []

  if (sheetName === "Inventory") {
    const productCol = resolveColumnIndex(headers, "product")
    if (productCol === -1) throw new Error("Could not find 'product' column in Inventory sheet")

    const productSet = new Set(items.map((i) => String(i.product)))

    dataRows.forEach((row, idx) => {
      if (productSet.has(row[productCol])) {
        matched.push(idx + 2) // +1 for header, +1 for 1-based indexing
      }
    })
  } else {
    const fieldIndices: Record<string, number> = {}
    for (const field of FIELDS_TO_MATCH) {
      const idx = resolveColumnIndex(headers, field)
      if (idx !== -1) fieldIndices[field] = idx
    }
    console.log("Field indices for matching:", fieldIndices)

    dataRows.forEach((row, idx) => {
      const isMatch = items.some((item) => rowMatchesItem(row, item, fieldIndices))
      if (isMatch) matched.push(idx + 2)
    })
  }

  return matched
}
