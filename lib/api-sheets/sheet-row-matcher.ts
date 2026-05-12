// lib/api-sheets/sheet-row-matcher.ts

function toCamelCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
}

export function findRowsToDelete(
  rows: string[][],
  items: Record<string, any>[],
  matchFields?: string[]
) {
  if (rows.length === 0) return []

  const [headers, ...dataRows] = rows

  const normalizedHeaders = headers.map((header) => toCamelCase(header))

  const rowIndexes: number[] = []

  dataRows.forEach((row, rowIndex) => {
    const rowObject: Record<string, any> = {}

    normalizedHeaders.forEach((header, index) => {
      rowObject[header] = row[index] ?? ""
    })

    const shouldDelete = items.some((item) => {
      // PRIORITY:
      // explicit match fields

      if (matchFields && matchFields.length > 0) {
        return matchFields.every((field) => {
          return (
            String(rowObject[field] ?? "")
              .trim()
              .toLowerCase() ===
            String(item[field] ?? "")
              .trim()
              .toLowerCase()
          )
        })
      }

      // FALLBACK:
      // ID matching

      if (item.id) {
        return String(rowObject.id) === String(item.id)
      }

      // LAST FALLBACK:
      // full object equality

      return Object.entries(item).every(([key, value]) => {
        return (
          String(rowObject[key] ?? "")
            .trim()
            .toLowerCase() ===
          String(value ?? "")
            .trim()
            .toLowerCase()
        )
      })
    })

    if (shouldDelete) {
      rowIndexes.push(rowIndex + 2)
    }
  })

  return rowIndexes
}
