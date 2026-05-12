"use client"

import { useMemo } from "react"

import { Filter } from "lucide-react"

import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Purchase } from "../../types/purchase.types"

export type PurchaseFilters = {
  products: string[]
  suppliers: string[]
}

type Props = {
  purchases: Purchase[]
  filters: PurchaseFilters
  onFiltersChange: (filters: PurchaseFilters) => void
}

export function PurchaseFilterDropdown({
  purchases,
  filters,
  onFiltersChange,
}: Props) {
  const products = useMemo(() => {
    return Array.from(new Set(purchases.map((item) => item.product)))
  }, [purchases])

  const suppliers = useMemo(() => {
    return Array.from(new Set(purchases.map((item) => item.supplier)))
  }, [purchases])

  const toggleValue = (current: string[], value: string) => {
    if (current.includes(value)) {
      return current.filter((item) => item !== value)
    }

    return [...current, value]
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[360px] rounded-2xl p-4">
        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Products</h4>

            <div className="rounded-xl border">
              <ScrollArea className="h-[180px]">
                <div className="space-y-2 p-3">
                  {products.map((product) => (
                    <button
                      key={product}
                      type="button"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          products: toggleValue(filters.products, product),
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                    >
                      <Checkbox checked={filters.products.includes(product)} />

                      <span className="truncate text-sm">{product}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Suppliers</h4>

            <div className="rounded-xl border">
              <ScrollArea className="h-[180px]">
                <div className="space-y-2 p-3">
                  {suppliers.map((supplier) => (
                    <button
                      key={supplier}
                      // type="button"
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          suppliers: toggleValue(filters.suppliers, supplier),
                        })
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={filters.suppliers.includes(supplier)}
                      />

                      <span className="truncate text-sm">{supplier}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
