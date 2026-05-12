"use client"

import { useEffect, useMemo, useState } from "react"

import { AlertTriangle, PackageX, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { getStockStatus } from "@/features/dashboard/services/stock.service"

import { Inventory } from "@/features/inventory/types/inventory.types"
import { useInventory } from "../hooks/use-inventory"

interface LowStockModalProps {
  open: boolean
  onClose: () => void
}

type RestockMap = Record<string, number>

export default function LowStockModal({ open, onClose }: LowStockModalProps) {
  const { inventory } = useInventory()

  const { lowStockProducts, negativeStockProducts } = useMemo(
    () => getStockStatus(inventory),
    [inventory]
  )

  const allProducts = useMemo(
    () => [...negativeStockProducts, ...lowStockProducts],
    [negativeStockProducts, lowStockProducts]
  )

  const [restockValues, setRestockValues] = useState<RestockMap>({})

  useEffect(() => {
    if (!open) return

    const initialValues: RestockMap = {}

    allProducts.forEach((item) => {
      initialValues[item.product] =
        item.reorderQuantity || item.minimumQuantity || 1
    })

    setRestockValues(initialValues)
  }, [allProducts, open])

  const handleQuantityChange = (product: string, value: number) => {
    if (Number.isNaN(value) || value < 1) return

    setRestockValues((prev) => ({
      ...prev,
      [product]: value,
    }))
  }

  const handleRestock = async () => {
    const payload = allProducts.map((item) => ({
      product: item.product,
      quantity: restockValues[item.product] || 1,
      currentStock: item.stock,
      minimumQuantity: item.minimumQuantity,
      reorderQuantity: item.reorderQuantity,
      unit: item.unit,
      category: item.category,
    }))

    console.log("🚀 Restock Request Payload:", payload)

    // TODO:
    // await createPurchaseOrder(payload)

    onClose()
  }

  const renderProductCard = (item: Inventory, type: "negative" | "low") => {
    const quantity = restockValues[item.product] || 1

    return (
      <div
        key={item.product}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/40 md:flex-row md:items-center md:justify-between"
      >
        {/* Left */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-foreground">
              {item.product}
            </h4>

            {type === "negative" ? (
              <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                Critical
              </span>
            ) : (
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-yellow-700">
                Low
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span>
              Current:
              <strong className="ml-1 text-foreground">{item.stock}</strong>
            </span>

            <span>
              Minimum:
              <strong className="ml-1 text-foreground">
                {item.minimumQuantity}
              </strong>
            </span>

            <span>
              Reorder:
              <strong className="ml-1 text-foreground">
                {item.reorderQuantity}
              </strong>
            </span>

            <span>
              Unit:
              <strong className="ml-1 text-foreground">{item.unit}</strong>
            </span>

            <span>
              Price:
              <strong className="ml-1 text-foreground">
                ₹{item.pricePerUnit}
              </strong>
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Restock Qty</label>

            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(item.product, Number(e.target.value))
              }
              className="w-28"
            />
          </div>
        </div>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Inventory Stock Alerts
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Review inventory shortages and generate restock requests.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {/* Negative Stock */}
          {negativeStockProducts.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageX className="h-5 w-5 text-red-600" />

                  <h3 className="text-lg font-semibold text-red-600">
                    Negative Stock
                  </h3>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {negativeStockProducts.length} Items
                </span>
              </div>

              <div className="space-y-3">
                {negativeStockProducts.map((item) =>
                  renderProductCard(item, "negative")
                )}
              </div>
            </section>
          )}

          {/* Low Stock */}
          {lowStockProducts.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />

                  <h3 className="text-lg font-semibold text-yellow-600">
                    Low Stock
                  </h3>
                </div>

                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                  {lowStockProducts.length} Items
                </span>
              </div>

              <div className="space-y-3">
                {lowStockProducts.map((item) => renderProductCard(item, "low"))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {!allProducts.length && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-green-100 p-5">
                <PackageX className="h-7 w-7 text-green-700" />
              </div>

              <h3 className="mt-5 text-xl font-semibold">Inventory Healthy</h3>

              <p className="mt-2 text-sm text-muted-foreground">
                No low-stock or negative-stock items detected.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleRestock}
            disabled={!allProducts.length}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Create Restock Request
          </Button>
        </div>
      </div>
    </div>
  )
}
