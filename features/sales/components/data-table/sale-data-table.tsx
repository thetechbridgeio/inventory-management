// features/sales/components/sales-table.tsx

"use client"

import { useEffect, useMemo, useState } from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { format } from "date-fns"

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

import { Card, CardContent } from "@/components/ui/card"
import { useSalesContext } from "../../context/sales-provider"
import { SalesItem } from "../../types/sales.types"
import { DeleteSelectedSalesButton } from "./delete-selected-sales"
import { SalesFilterDropdown, SalesFilters } from "./sales-filter"
import { SalesSearchInput } from "./search-sales"
import { ExportSalesPDFButton } from "./export-sale-pdf-button"

const ITEMS_PER_PAGE = 10

export function SalesTable() {
  const { sales, loading } = useSalesContext()

  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [search, setSearch] = useState("")

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<SalesFilters>({
    products: [],
    companies: [],
    startDate: undefined,
    endDate: undefined,
  })

  const formattedSales = useMemo(() => {
    return sales.map((item, index) => ({
      ...item,

      rowId: `${item.product}-${item.companyName}-${item.dateOfIssue}-${index}`,
    }))
  }, [sales])

  const filteredSales = useMemo(() => {
    const searchValue = search.trim().toLowerCase()

    return formattedSales.filter((item) => {
      const productMatch =
        filters.products.length === 0 || filters.products.includes(item.product)

      const companyMatch =
        filters.companies.length === 0 ||
        filters.companies.includes(item.companyName)

      const issueDate = new Date(item.dateOfIssue)

      const startDateMatch =
        !filters.startDate || issueDate >= filters.startDate

      const endDateMatch = !filters.endDate || issueDate <= filters.endDate

      const searchMatch =
        searchValue === "" ||
        [item.product, item.companyName, item.contact, item.unit]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchValue))

      return (
        productMatch &&
        companyMatch &&
        startDateMatch &&
        endDateMatch &&
        searchMatch
      )
    })
  }, [formattedSales, filters, search])

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE) || 1

  const paginatedSales = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE

    const end = start + ITEMS_PER_PAGE

    return filteredSales.slice(start, end)
  }, [filteredSales, page])

  const toggleRow = (rowId: string) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((item) => item !== rowId)
        : [...prev, rowId]
    )
  }

  useEffect(() => {
    setPage(1)
  }, [filters, search])

  if (loading) {
    return (
      <Card className="rounded-3xl border shadow-none">
        <CardContent className="flex h-60 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading sales data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={7}>
                <div className="px-6 py-4 w-full flex items-center justify-between gap-6">
                  <h2 className="text-xl font-semibold">Sales Item</h2>
                  <div className="flex justify-end gap-3">
                    <SalesSearchInput value={search} onChange={setSearch} />
                    <SalesFilterDropdown
                      sales={sales}
                      filters={filters}
                      onFiltersChange={setFilters}
                    />
                    <ExportSalesPDFButton data={filteredSales} />
                    <DeleteSelectedSalesButton
                      selectedItems={formattedSales.filter((item) =>
                        selectedRows.includes(item.rowId)
                      )}
                    />
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[60px] px-6" />

              <TableHead className="font-semibold">Product</TableHead>

              <TableHead className="font-semibold">Quantity</TableHead>

              <TableHead className="font-semibold">Unit</TableHead>

              <TableHead className="font-semibold">Contact</TableHead>

              <TableHead className="font-semibold">Company</TableHead>

              <TableHead className="font-semibold">Date Issued</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-60">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      No sales records found
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedSales.map(
                (
                  item: SalesItem & {
                    rowId: string
                  }
                ) => (
                  <TableRow
                    key={item.rowId}
                    className="transition-colors hover:bg-muted/30"
                  >
                    {/* CHECKBOX */}
                    <TableCell className="px-6 py-3.5">
                      <Checkbox
                        checked={selectedRows.includes(item.rowId)}
                        onCheckedChange={() => toggleRow(item.rowId)}
                      />
                    </TableCell>

                    {/* PRODUCT */}
                    <TableCell className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {item.product}
                        </span>
                      </div>
                    </TableCell>

                    {/* QUANTITY */}
                    <TableCell className="py-3.5">
                      <span className="font-medium">{item.quantity}</span>
                    </TableCell>

                    {/* UNIT */}
                    <TableCell className="py-3.5">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {item.unit}
                      </Badge>
                    </TableCell>

                    {/* CONTACT */}
                    <TableCell className="py-3.5">
                      <span className="text-sm text-muted-foreground">
                        {item.contact}
                      </span>
                    </TableCell>

                    {/* COMPANY */}
                    <TableCell className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium">{item.companyName}</span>
                      </div>
                    </TableCell>

                    {/* DATE */}
                    <TableCell className="py-3.5">
                      <span className="text-sm">
                        {format(new Date(item.dateOfIssue), "dd MMM yyyy")}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedSales.length} of {filteredSales.length} sales
            records
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({
                length: totalPages,
              }).map((_, index) => {
                const currentPage = index + 1

                return (
                  <Button
                    key={currentPage}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="h-9 min-w-[36px] rounded-xl"
                    onClick={() => setPage(currentPage)}
                  >
                    {currentPage}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
