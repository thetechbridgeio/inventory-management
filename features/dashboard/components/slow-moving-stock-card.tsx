"use client"

import { ArchiveX, Clock3 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { getSlowMovingStock } from "../services/slow-moving-stock"
import { useInventoryContext } from "@/features/inventory/context/inventory-provider"
import { useSalesContext } from "@/features/sales/context/sales-provider"

export default function SlowMovingStockCard() {
  const { inventory } = useInventoryContext()

  const { sales } = useSalesContext()

  const { slowMovingProducts, totalSlowMovingProducts } = getSlowMovingStock({
    inventory,
    sales,
  })

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-background shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        {/* Left */}
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Slow Moving Stock
          </CardTitle>

          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-orange-700">
              {totalSlowMovingProducts}
            </h2>

            <Badge
              variant="secondary"
              className="border-orange-200 bg-orange-100 text-orange-700"
            >
              90+ Days
            </Badge>
          </div>
        </div>

        {/* Right */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">
          <Clock3 className="h-6 w-6 text-orange-700" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="rounded-xl border border-orange-200 bg-orange-100/50 p-3 text-xs text-orange-800">
          Products that have not recorded any sales movement in the last 90
          days.
        </div>

        {/* Product List */}
        {slowMovingProducts.length > 0 ? (
          <div className="space-y-2">
            {slowMovingProducts.slice(0, 5).map((item) => (
              <div
                key={item.product}
                className="flex items-center justify-between rounded-xl border bg-background px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product}</p>

                  <p className="text-xs text-muted-foreground">
                    {item.category}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Stock: {item.stock}
                  </Badge>
                </div>
              </div>
            ))}

            {slowMovingProducts.length > 5 && (
              <div className="pt-1 text-center text-xs text-muted-foreground">
                +{slowMovingProducts.length - 5} more products
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-10 text-center">
            <div className="rounded-full bg-green-100 p-3">
              <ArchiveX className="h-5 w-5 text-green-700" />
            </div>

            <h3 className="mt-3 text-sm font-semibold">No Slow Moving Stock</h3>

            <p className="mt-1 text-xs text-muted-foreground">
              All inventory items have recent movement.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
