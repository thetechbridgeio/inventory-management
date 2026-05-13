"use client"

import { useEffect, useMemo, useState } from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"

import { Checkbox } from "@/components/ui/checkbox"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DeleteSelectedPurchasesButton } from "./delete-selected-purchases-button"

import {
  PurchaseFilterDropdown,
  type PurchaseFilters,
} from "./purchase-filter-dropdown"

import { PurchaseSearchInput } from "./purchase-search-input"
import { usePurchasesContext } from "../../context/purchase-provider"
import { Purchase } from "../../types/purchase.types"
import { ExportPurchasesPDFButton } from "./export-purchase-pdf-button"
import { formatSafeDate } from "@/lib/format-date-safely"

const ITEMS_PER_PAGE = 10

export function PurchasesTable() {
  const { purchases, loading } = usePurchasesContext()

  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const [search, setSearch] = useState("")

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<PurchaseFilters>({
    products: [],
    suppliers: [],
  })

  const formattedPurchases = useMemo(() => {
    return purchases.map((item, index) => ({
      ...item,
      rowId: `${item.product}-${item.poNumber}-${index}`,
    }))
  }, [purchases])

  const filteredPurchases = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return formattedPurchases.filter((item) => {
      const productMatch =
        filters.products.length === 0 || filters.products.includes(item.product)

      const supplierMatch =
        filters.suppliers.length === 0 ||
        filters.suppliers.includes(item.supplier)

      const searchMatch =
        searchValue === "" ||
        [item.product, item.poNumber, item.supplier, item.rackNumber].some(
          (value) => String(value).toLowerCase().includes(searchValue)
        )

      return productMatch && supplierMatch && searchMatch
    })
  }, [formattedPurchases, filters, search])

  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE) || 1

  const paginatedPurchases = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE

    return filteredPurchases.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPurchases, page])

  useEffect(() => {
    setPage(1)
  }, [filters, search])

  const toggleRow = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((item) => item !== rowId)
        : [...prev, rowId]
    )
  }

  if (loading) {
    return (
      <div className="flex h-60 text-sm items-center justify-center rounded-3xl border bg-white">
        Loading purchases...
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
                <div className="flex w-full items-center justify-between gap-6 px-6 py-4">
                  <h2 className="text-xl font-semibold">Purchases</h2>

                  <div className="flex gap-3">
                    <PurchaseSearchInput value={search} onChange={setSearch} />

                    <PurchaseFilterDropdown
                      purchases={purchases}
                      filters={filters}
                      onFiltersChange={setFilters}
                    />

                    <ExportPurchasesPDFButton data={filteredPurchases} />
                    <DeleteSelectedPurchasesButton
                      selectedItems={formattedPurchases.filter((item) =>
                        selectedRows.includes(item.rowId)
                      )}
                    />
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[60px] px-6" />

              <TableHead>Product</TableHead>

              <TableHead>Quantity</TableHead>

              <TableHead>Unit</TableHead>

              <TableHead>PO Number</TableHead>

              <TableHead>Supplier</TableHead>

              {/* <TableHead>Rack</TableHead> */}

              <TableHead>Date Received</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-60 text-center">
                  No purchase records found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPurchases.map(
                (
                  item: Purchase & {
                    rowId: string
                  }
                ) => (
                  <TableRow key={item.rowId}>
                    <TableCell className="px-6 py-3.5">
                      <Checkbox
                        checked={selectedRows.includes(item.rowId)}
                        onCheckedChange={() => toggleRow(item.rowId)}
                      />
                    </TableCell>

                    <TableCell className="py-3.5">{item.product}</TableCell>

                    <TableCell className="py-3.5">{item.quantity}</TableCell>

                    <TableCell className="py-3.5">
                      <Badge variant="secondary">{item.unit}</Badge>
                    </TableCell>

                    <TableCell className="py-3.5">{item.poNumber}</TableCell>

                    <TableCell className="py-3.5">{item.supplier}</TableCell>

                    {/* <TableCell className="py-3.5">{item.rackNumber}</TableCell> */}

                    <TableCell className="py-3.5">
                      {formatSafeDate(item.dateOfReceiving)}
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 rounded-xl border bg-background/60 px-4 py-3 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1 text-center lg:text-left">
              <p className="text-sm font-medium text-foreground">
                Showing{" "}
                <span className="font-semibold">
                  {Math.min(
                    (page - 1) * ITEMS_PER_PAGE + 1,
                    filteredPurchases.length
                  )}
                </span>{" "}
                -
                <span className="font-semibold">
                  {" "}
                  {Math.min(page * ITEMS_PER_PAGE, filteredPurchases.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {filteredPurchases.length}
                </span>{" "}
                purchases
              </p>

              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-lg"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
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
                        className={`h-9 min-w-[38px] shrink-0 rounded-lg transition-all ${
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
                className="h-9 w-9 shrink-0 rounded-lg"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
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
