import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const clientId = url.searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId required" },
        { status: 400 }
      )
    }

    // Fetch inventory
    const res = await fetch(
      `${url.origin}/api/sheets?sheet=Inventory&clientId=${clientId}`
    )

    const json = await res.json()
    const data = json.data || []

    // Normalize fields
    const inventory = data.map((item: any) => {
      const quantity =
        item.quantity ??
        item.Quantity ??
        item.stock ??
        item.Stock ??
        0

      const minimumQuantity =
        item["Minimum Quantity"] ??
        item.minimumQuantity ??
        item.minQty ??
        0

      return {
        ...item,
        quantity,
        minimumQuantity,
      }
    })

    // Out of stock
    const outOfStock = inventory.filter(
      (i: any) => i.quantity === 0
    )

    // Low stock (dynamic threshold)
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
    console.error("Low stock API error:", error)

    return NextResponse.json(
      { error: "Failed to fetch low stock data" },
      { status: 500 }
    )
  }
}