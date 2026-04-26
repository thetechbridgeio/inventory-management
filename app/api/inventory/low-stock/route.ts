import { NextResponse } from "next/server"

const LOW_STOCK_THRESHOLD = 50

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

    // fetch inventory
    const res = await fetch(
      `${url.origin}/api/sheets?sheet=Inventory&clientId=${clientId}`
    )

    const json = await res.json()
    const data = json.data || []

    // normalize quantity
    const inventory = data.map((item: any) => ({
      ...item,
      quantity:
        item.quantity ??
        item.Quantity ??
        item.stock ??
        item.Stock ??
        0,
    }))

    // filter
    const outOfStock = inventory.filter((i: any) => i.quantity === 0)

    const lowStock = inventory.filter(
      (i: any) =>
        i.quantity > 0 &&
        i.quantity <= LOW_STOCK_THRESHOLD
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