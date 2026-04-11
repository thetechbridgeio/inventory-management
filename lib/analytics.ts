import type { InventoryItem } from "./types"

export function classifyVC(item: InventoryItem): string {
  const value = item.pricePerUnit * item.stock
  const volume = item.stock

  const HIGH_VALUE_THRESHOLD = 100000
  const HIGH_VOLUME_THRESHOLD = 100

  if (value >= HIGH_VALUE_THRESHOLD && volume >= HIGH_VOLUME_THRESHOLD) {
    return "High Value – High Volume"
  }
  if (value >= HIGH_VALUE_THRESHOLD) {
    return "High Value – Low Volume"
  }
  if (volume >= HIGH_VOLUME_THRESHOLD) {
    return "Low Value – High Volume"
  }
  return "Low Value – Low Volume"
}

export function generateVCAnalysisTable(items: InventoryItem[]): string {
  return items
    .map((item) => {
      const classification = classifyVC(item)
      return `
        <tr>
          <td>${item.product}</td>
          <td>₹${item.pricePerUnit.toLocaleString("en-IN")}</td>
          <td>${item.stock}</td>
          <td>${classification}</td>
        </tr>
      `
    })
    .join("")
}