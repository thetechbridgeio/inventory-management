// app/api/low-stock/route.ts

import { NextResponse } from "next/server"
import { getSheetId } from "@/utils/get-sheet-id"
import { getSheetData } from "@/lib/api-sheets/sheet-service"
import { handleApiError } from "@/lib/api-sheets/api-error"

function normalizeInventory(item: any) {
  const quantityRaw =
    item.quantity ??
    item.Quantity ??
    item.stock ??
    item.Stock ??
    0

  const minRaw =
    item.minimumQuantity ??
    item["Minimum Quantity"] ??
    item.minQty ??
    0

  return {
    ...item,
    quantity: Number(quantityRaw) || 0,
    minimumQuantity: Number(minRaw) || 0,
  }
}

export async function GET(request: Request) {
  try {
    const sheetId = await getSheetId(request)

    if (!sheetId) {
      return NextResponse.json(
        { error: "clientId required or invalid" },
        { status: 400 }
      )
    }

    const data = await getSheetData(sheetId, "Inventory")

    const inventory = data.map(normalizeInventory)

    const outOfStock = inventory.filter((i: any) => i.quantity === 0)
    const lowStock = inventory.filter(
      (i: any) =>
        i.quantity > 0 &&
        i.minimumQuantity > 0 &&
        i.quantity <= i.minimumQuantity
    )

    return NextResponse.json({
      lowStock,
      outOfStock,
      total: lowStock.length + outOfStock.length,
    })
  } catch (error) {
    return handleApiError(error, "Failed to fetch low stock data")
  }
}