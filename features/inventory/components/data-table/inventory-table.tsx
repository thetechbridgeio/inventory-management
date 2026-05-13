"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Inventory } from "../../types/inventory.types"
import { useInventoryContext } from "../../context/inventory-provider"
import { EditInventoryDialog } from "./edit-inventory-dialog"
import { DeleteSelectedInventoryButton } from "./delete-selected-button"
import { RefreshInventoryButton } from "../refresh-inventory-button"
import { InventoryFilterDropdown, InventoryFilters } from "./inventory-filter"
import { InventorySearchInput } from "./inventory-search-input"
import { ExportInventoryPDFButton } from "./export-inventory-pdf-button"

const ITEMS_PER_PAGE = 10

type InventoryStatus =
  | "Negative Stock"
  | "Low Stock"
  | "Normal Stock"
  | "Exceed Stock"

function getInventoryStatus(item: Inventory): InventoryStatus {
  if (item.stock < 0) {
    return "Negative Stock"
  }

  if (item.stock < item.minimumQuantity) {
    return "Low Stock"
  }

  if (item.stock > item.maximumQuantity) {
    return "Exceed Stock"
  }

  return "Normal Stock"
}

function getStatusBadgeClass(status: InventoryStatus) {
  switch (status) {
    case "Negative Stock":
      return "bg-red-100 text-red-700 border-red-200"

    case "Low Stock":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"

    case "Exceed Stock":
      return "bg-blue-100 text-blue-700 border-blue-200"

    default:
      return "bg-green-100 text-green-700 border-green-200"
  }
}

function getProductTypeBadgeClass(productType: "Raw" | "Finished") {
  return productType === "Raw"
    ? "bg-orange-100 text-orange-700 border-orange-200"
    : "bg-violet-100 text-violet-700 border-violet-200"
}

export function InventoryTable() {
  const { inventory, loading } = useInventoryContext()

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<InventoryFilters>({
    statuses: [],
    productTypes: [],
    categories: [],
  })

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const status = getInventoryStatus(item)

      const statusMatch =
        filters.statuses.length === 0 || filters.statuses.includes(status)

      const productTypeMatch =
        filters.productTypes.length === 0 ||
        filters.productTypes.includes(item.productType)

      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(item.category)

      const searchMatch =
        search.trim() === "" ||
        [
          item.product,
          item.category,
          item.location,
          item.unit,
          item.productType,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search.toLowerCase()))

      return statusMatch && productTypeMatch && categoryMatch && searchMatch
    })
  }, [inventory, filters, search])

  const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE)

  const paginatedInventory = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE

    const end = start + ITEMS_PER_PAGE

    return filteredInventory.slice(start, end)
  }, [filteredInventory, page])

  const toggleRow = (product: string) => {
    setSelectedRows((prev) =>
      prev.includes(product)
        ? prev.filter((item) => item !== product)
        : [...prev, product]
    )
  }

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center rounded-2xl border border-border bg-background">
        <p className="text-sm text-muted-foreground">Loading inventory...</p>
      </div>
    )
  }

  if (!inventory.length) {
    return (
      <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-border bg-background">
        <p className="text-sm text-muted-foreground">No inventory found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={10}>
                <div className="px-6 py-4 w-full flex items-center justify-between gap-6">
                  <h2 className="text-xl font-semibold">Inventory Item</h2>
                  <div className="flex justify-end gap-3">
                    <InventorySearchInput value={search} onChange={setSearch} />
                    <InventoryFilterDropdown
                      inventory={inventory}
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                    <ExportInventoryPDFButton data={filteredInventory} />
                    <DeleteSelectedInventoryButton
                      selectedItems={inventory.filter((item) =>
                        selectedRows.includes(item.product)
                      )}
                    />
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[50px] px-6" />

              <TableHead className="py-4 font-semibold">Product</TableHead>

              <TableHead className="py-4 font-semibold">Unit</TableHead>

              <TableHead className="py-4 font-semibold">Location</TableHead>

              <TableHead className="py-4 font-semibold">Category</TableHead>

              <TableHead className="py-4 font-semibold">Stock</TableHead>

              <TableHead className="py-4 font-semibold">Status</TableHead>

              <TableHead className="py-4 font-semibold">Price</TableHead>

              <TableHead className="py-4 font-semibold">Value</TableHead>

              <TableHead className="py-4 font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInventory.map((item: Inventory, index: number) => {
              const status = getInventoryStatus(item)

              return (
                <TableRow
                  key={index}
                  className="border-b transition-colors hover:bg-muted/40"
                >
                  <TableCell className="w-[50px]">
                    <Checkbox
                      checked={selectedRows.includes(item.product)}
                      onCheckedChange={() => toggleRow(item.product)}
                    />
                  </TableCell>

                  <TableCell className="min-w-40">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {item.product}
                      </span>

                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-3 py-1 mt-1 font-medium",
                          getProductTypeBadgeClass(item.productType)
                        )}
                      >
                        {item.productType?.trim()
                          ? item.productType.toLowerCase() === "raw"
                            ? "Raw"
                            : item.productType.toLowerCase() === "finished"
                              ? "Finished"
                              : "Unknown"
                          : "Unknown"}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {item.unit}
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {item.location || "-"}
                  </TableCell>

                  <TableCell>{item.category}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.stock}</span>

                      <span className="text-xs text-muted-foreground">
                        Min: {item.minimumQuantity}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-1 font-medium",
                        getStatusBadgeClass(status)
                      )}
                    >
                      {status}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-medium">
                    ₹{item.pricePerUnit.toLocaleString()}
                  </TableCell>

                  <TableCell className="font-semibold">
                    ₹{item.value.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <EditInventoryDialog inventory={item} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 rounded-2xl border bg-background/60 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1 text-center lg:text-left">
              <p className="text-sm font-medium text-foreground">
                Showing{" "}
                <span className="font-semibold">
                  {Math.min((page - 1) * ITEMS_PER_PAGE + 1, inventory.length)}
                </span>
                {" - "}
                <span className="font-semibold">
                  {Math.min(page * ITEMS_PER_PAGE, inventory.length)}
                </span>{" "}
                of <span className="font-semibold">{inventory.length}</span>{" "}
                items
              </p>

              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="h-9 w-9 shrink-0 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = []

                  const startPage = Math.max(1, page - 1)
                  const endPage = Math.min(totalPages, page + 1)

                  if (startPage > 1) {
                    pages.push(1)

                    if (startPage > 2) {
                      pages.push("...")
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i)
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push("...")
                    }

                    pages.push(totalPages)
                  }

                  return pages.map((item, index) =>
                    item === "..." ? (
                      <div
                        key={`ellipsis-${index}`}
                        className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                      >
                        ...
                      </div>
                    ) : (
                      <Button
                        key={item}
                        variant={item === page ? "default" : "outline"}
                        size="sm"
                        className={`h-9 min-w-[38px] shrink-0 rounded-xl transition-all ${
                          item === page
                            ? "pointer-events-none shadow-sm"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setPage(Number(item))}
                      >
                        {item}
                      </Button>
                    )
                  )
                })()}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="h-9 w-9 shrink-0 rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
