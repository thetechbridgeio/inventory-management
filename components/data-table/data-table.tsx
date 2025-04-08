"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[] | (() => ColumnDef<TData, TValue>[])
  data: TData[]
  onRowSelectionChange?: (rows: TData[]) => void
}

export function DataTable<TData, TValue>({
  columns: columnsOrFn,
  data,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  // Simple state management without complex hooks
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  // Resolve columns if it's a function
  const columns = typeof columnsOrFn === "function" ? columnsOrFn() : columnsOrFn

  // Calculate pagination
  const pageCount = Math.ceil(data.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const currentPageData = data.slice(startIndex, endIndex)

  // Handle row selection
  const toggleRowSelection = (row: any) => {
    // Use a unique identifier for the row - fallback to index if no id/srNo/_uniqueId
    const rowId = row._uniqueId || row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)

    const newSelectedRows = { ...selectedRows }
    newSelectedRows[rowId] = !newSelectedRows[rowId]
    setSelectedRows(newSelectedRows)

    // Notify parent component of selection change
    if (onRowSelectionChange) {
      const selectedItems = data.filter((item: any) => {
        const itemId = item._uniqueId || item.srNo?.toString() || item.id?.toString() || JSON.stringify(item)
        return newSelectedRows[itemId]
      })
      onRowSelectionChange(selectedItems)
    }
  }

  // Handle select all rows on current page
  const toggleSelectAll = () => {
    const newSelectedRows = { ...selectedRows }
    const allSelected = currentPageData.every((row: any) => {
      const rowId = row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)
      return selectedRows[rowId]
    })

    currentPageData.forEach((row: any) => {
      const rowId = row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)
      newSelectedRows[rowId] = !allSelected
    })

    setSelectedRows(newSelectedRows)

    // Notify parent component of selection change
    if (onRowSelectionChange) {
      const selectedItems = data.filter((item: any) => {
        const itemId = item.srNo?.toString() || item.id?.toString() || JSON.stringify(item)
        return newSelectedRows[itemId]
      })
      onRowSelectionChange(selectedItems)
    }
  }

  // Check if all rows on current page are selected
  const allRowsSelected =
    currentPageData.length > 0 &&
    currentPageData.every((row: any) => {
      const rowId = row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)
      return selectedRows[rowId]
    })

  // Check if some rows on current page are selected
  const someRowsSelected =
    currentPageData.some((row: any) => {
      const rowId = row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)
      return selectedRows[rowId]
    }) && !allRowsSelected

  // Count total selected rows
  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                // Special handling for the select column
                if (column.id === "select") {
                  return (
                    <TableHead key="select" className="w-12">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={allRowsSelected}
                          indeterminate={someRowsSelected ? "true" : undefined}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </TableHead>
                  )
                }

                // Regular column header
                return (
                  <TableHead key={index}>
                    {typeof column.header === "function"
                      ? column.header({ column: { getIsSorted: () => false, toggleSorting: () => {} } })
                      : column.header}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="cursor-pointer hover:bg-muted/50 h-10"
                  data-state={
                    selectedRows[row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)]
                      ? "selected"
                      : undefined
                  }
                >
                  {columns.map((column, colIndex) => {
                    // Special handling for the select column
                    if (column.id === "select") {
                      return (
                        <TableCell key="select" onClick={(e) => e.stopPropagation()} className="py-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                !!selectedRows[row.srNo?.toString() || row.id?.toString() || JSON.stringify(row)]
                              }
                              onChange={() => toggleRowSelection(row)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                        </TableCell>
                      )
                    }

                    // Special handling for the srNo column - display sequential number
                    if (column.accessorKey === "srNo") {
                      return (
                        <TableCell key={colIndex} onClick={() => toggleRowSelection(row)} className="py-1">
                          <div className="text-center font-medium">{startIndex + rowIndex + 1}</div>
                        </TableCell>
                      )
                    }

                    // Special handling for the actions column
                    if (column.id === "actions" && typeof column.cell === "function") {
                      return (
                        <TableCell key={colIndex} onClick={(e) => e.stopPropagation()} className="py-1">
                          {column.cell({ row: { original: row } })}
                        </TableCell>
                      )
                    }

                    // Regular cell with accessor
                    if ("accessorKey" in column) {
                      const accessorKey = column.accessorKey as keyof typeof row
                      const value = row[accessorKey]

                      return (
                        <TableCell key={colIndex} onClick={() => toggleRowSelection(row)} className="py-1">
                          {typeof column.cell === "function"
                            ? column.cell({ row: { getValue: () => value, original: row } })
                            : String(value !== undefined ? value : "")}
                        </TableCell>
                      )
                    }

                    // Fallback for other column types
                    return (
                      <TableCell key={colIndex} onClick={() => toggleRowSelection(row)} className="py-1">
                        {typeof column.cell === "function" ? column.cell({ row: { original: row } }) : null}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div>
            {selectedRowsCount} of {data.length} row(s) selected
          </div>
          <div className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {currentPage + 1} of {Math.max(1, pageCount)}
            </strong>
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(0) // Reset to first page when changing page size
            }}
            className="h-8 w-[70px] rounded-md border border-input bg-background px-2"
          >
            {[5, 10, 15, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div>per page</div>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
          >
            <span className="sr-only">Go to first page</span>
            <span aria-hidden="true">&laquo;</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Go to previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Go to next page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(pageCount - 1)}
            disabled={currentPage >= pageCount - 1}
          >
            <span className="sr-only">Go to last page</span>
            <span aria-hidden="true">&raquo;</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
