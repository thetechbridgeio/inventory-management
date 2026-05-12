"use client"

import { useMemo, useState } from "react"

import { Filter, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Inventory } from "../../types/inventory.types"

// ─── Types ────────────────────────────────────────────────────────────────────

export type InventoryStatus =
  | "Negative Stock"
  | "Low Stock"
  | "Normal Stock"
  | "Exceed Stock"

export type InventoryFilters = {
  statuses: InventoryStatus[]
  productTypes: ("Raw" | "Finished")[]
  categories: string[]
}

type Props = {
  inventory: Inventory[]
  filters: InventoryFilters
  onFiltersChange: (filters: InventoryFilters) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STOCK_STATUSES: InventoryStatus[] = [
  "Negative Stock",
  "Low Stock",
  "Normal Stock",
  "Exceed Stock",
]

const PRODUCT_TYPES = ["Raw", "Finished"] as const

// ─── Helper ───────────────────────────────────────────────────────────────────

export function getInventoryStatus(item: Inventory): InventoryStatus {
  if (item.stock < 0) return "Negative Stock"
  if (item.stock < item.minimumQuantity) return "Low Stock"
  if (item.stock > item.maximumQuantity) return "Exceed Stock"
  return "Normal Stock"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryFilterDropdown({
  inventory,
  filters,
  onFiltersChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const categories = useMemo(
    () =>
      Array.from(new Set(inventory.map((item) => item.category.trim()))).sort(),
    [inventory]
  )

  const totalActiveFilters =
    filters.statuses.length +
    filters.productTypes.length +
    filters.categories.length

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      statuses: value === "__all__" ? [] : [value as InventoryStatus],
    })
  }

  const toggleItem = <T extends string>(value: T, current: T[]): T[] =>
    current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]

  const handleProductTypeToggle = (type: "Raw" | "Finished") => {
    onFiltersChange({
      ...filters,
      productTypes: toggleItem(type, filters.productTypes),
    })
  }

  const handleCategoryToggle = (category: string) => {
    onFiltersChange({
      ...filters,
      categories: toggleItem(category, filters.categories),
    })
  }

  const clearFilters = () => {
    onFiltersChange({ statuses: [], productTypes: [], categories: [] })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const currentStatus = filters.statuses[0] ?? "__all__"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {totalActiveFilters > 0 && (
            <Badge className="ml-2 rounded-full px-2 py-0 text-xs">
              {totalActiveFilters}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[280px] rounded-2xl p-0 shadow-lg"
        sideOffset={6}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Filter Inventory</p>

          {totalActiveFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-4 p-4">
          {/* Stock Status — Select */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Stock Status
            </p>

            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full rounded-lg">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="__all__">All statuses</SelectItem>
                {STOCK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Product Type — Checkboxes */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Product Type
            </p>

            <div className="space-y-2">
              {PRODUCT_TYPES.map((type) => {
                const id = `product-type-${type}`
                return (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={id}
                      checked={filters.productTypes.includes(type)}
                      onCheckedChange={() => handleProductTypeToggle(type)}
                    />
                    <Label
                      htmlFor={id}
                      className="cursor-pointer select-none text-sm font-normal"
                    >
                      {type}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Categories — Checkboxes */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Categories
            </p>

            <ScrollArea
              className={categories.length > 6 ? "h-[160px]" : "h-auto"}
            >
              <div className="space-y-2 pr-3">
                {categories.map((category) => {
                  const id = `category-${category}`
                  return (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <Label
                        htmlFor={id}
                        className="cursor-pointer select-none truncate text-sm font-normal"
                        title={category}
                      >
                        {category}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
