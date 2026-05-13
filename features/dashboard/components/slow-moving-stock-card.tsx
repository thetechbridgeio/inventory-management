"use client"

import { ArchiveX, Clock3, Eye } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import { ScrollArea } from "@/components/ui/scroll-area"

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
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
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

        {/* CTA */}
        {slowMovingProducts.length > 0 ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className=" w-fit border-orange-200 bg-background hover:bg-orange-50"
              >
                <Eye className="mr-2 h-4 w-4" />
                View All
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-orange-600" />
                  Slow Moving Inventory
                </DialogTitle>

                <DialogDescription>
                  Products with no sales movement in the last 90 days.
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[65vh] pr-4">
                <div className="space-y-3 pt-2">
                  {slowMovingProducts.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                    >
                      {/* Left */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {item.product}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.category}</span>

                          {item.location && (
                            <>
                              <span>•</span>
                              <span>{item.location}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Stock: {item.stock}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
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
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div className="rounded-xl border border-orange-200 bg-orange-100/50 p-3 text-xs text-orange-800">
          Products that have not recorded any sales movement in the last 90
          days.
        </div>
      </CardContent>
    </Card>
  )
}
