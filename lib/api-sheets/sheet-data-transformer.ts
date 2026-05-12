// lib/api-sheets/sheet-data-transformer.ts

function toCamelCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
}

function normalizeCellValue(value: any) {
  // Boolean handling

  if (value === "TRUE") return true
  if (value === "FALSE") return false

  // Number handling

  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !isNaN(Number(value))
  ) {
    return Number(value)
  }

  return value
}

export function transformSheetRows(
  headers: string[],
  rows: string[][],
  sheetName?: string
) {
  return rows.map((row) => {
    const transformedRow: Record<string, any> = {}

    headers.forEach((header, index) => {
      const key = toCamelCase(header)

      transformedRow[key] = normalizeCellValue(row[index] ?? "")
    })

    return transformedRow
  })
}
