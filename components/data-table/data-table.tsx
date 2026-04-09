"use client"

import { useState, useRef, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowSelectionChange?: (rows: TData[]) => void
}

// Separate component to handle the indeterminate checkbox correctly via ref
function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300"
    />
  )
}

export function DataTable<TData, TValue>({ columns, data, onRowSelectionChange }: DataTableProps<TData, TValue>) {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  const pageCount = Math.ceil(data.length / pageSize)
  const startIndex = currentPage * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const currentPageData = data.slice(startIndex, endIndex)

  const getRowId = (row: unknown): string => {
    const r = row as Record<string, unknown>
    return (r.srNo?.toString() ?? r.id?.toString()) ?? JSON.stringify(row)
  }

  const toggleRowSelection = (row: TData) => {
    const rowId = getRowId(row)
    const newSelectedRows = { ...selectedRows, [rowId]: !selectedRows[rowId] }
    setSelectedRows(newSelectedRows)

    onRowSelectionChange?.(
      data.filter((item) => newSelectedRows[getRowId(item)])
    )
  }

  const toggleSelectAll = () => {
    const allSelected = currentPageData.every((row) => selectedRows[getRowId(row)])
    const newSelectedRows = { ...selectedRows }

    currentPageData.forEach((row) => {
      newSelectedRows[getRowId(row)] = !allSelected
    })

    setSelectedRows(newSelectedRows)
    onRowSelectionChange?.(data.filter((item) => newSelectedRows[getRowId(item)]))
  }

  const allRowsSelected =
    currentPageData.length > 0 && currentPageData.every((row) => selectedRows[getRowId(row)])

  const someRowsSelected =
    !allRowsSelected && currentPageData.some((row) => selectedRows[getRowId(row)])

  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                if (column.id === "select") {
                  return (
                    <TableHead key="select" className="w-12">
                      <div className="flex items-center">
                        <IndeterminateCheckbox
                          checked={allRowsSelected}
                          indeterminate={someRowsSelected}
                          onChange={toggleSelectAll}
                        />
                      </div>
                    </TableHead>
                  )
                }

                return (
                  <TableHead key={index}>
                    {typeof column.header === "function"
                      ? column.header({
                          column: {
                            getIsSorted: () => false,
                            toggleSorting: () => {},
                          } as any,
                          header: {} as any,
                          table: {} as any,
                        })
                      : column.header}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row, rowIndex) => {
                const rowId = getRowId(row)
                return (
                  <TableRow
                    key={rowIndex}
                    className="cursor-pointer hover:bg-muted/50 h-10"
                    data-state={selectedRows[rowId] ? "selected" : undefined}
                  >
                    {columns.map((column, colIndex) => {
                      if (column.id === "select") {
                        return (
                          <TableCell key="select" onClick={(e) => e.stopPropagation()} className="py-1">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={!!selectedRows[rowId]}
                                onChange={() => toggleRowSelection(row)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </div>
                          </TableCell>
                        )
                      }

                      if ((column as any).accessorKey === "srNo") {
                        return (
                          <TableCell key={colIndex} onClick={() => toggleRowSelection(row)} className="py-1">
                            <div className="text-center font-medium">{startIndex + rowIndex + 1}</div>
                          </TableCell>
                        )
                      }

                      if (column.id === "actions" && typeof column.cell === "function") {
                        return (
                          <TableCell key={colIndex} onClick={(e) => e.stopPropagation()} className="py-1">
                            {column.cell({ row: { original: row } } as any)}
                          </TableCell>
                        )
                      }

                      if ("accessorKey" in column) {
                        const accessorKey = column.accessorKey as string
                        const value = (row as Record<string, unknown>)[accessorKey]

                        return (
                          <TableCell key={colIndex} onClick={() => toggleRowSelection(row)} className="py-1">
                            {typeof column.cell === "function"
                              ? column.cell({ row: { getValue: () => value, original: row } } as any)
                              : String(value ?? "")}
                          </TableCell>
                        )
                      }

                      return (
                        <TableCell key={colIndex} onClick={() => toggleRowSelection(row)} className="py-1">
                          {typeof column.cell === "function"
                            ? column.cell({ row: { original: row } } as any)
                            : null}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
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
              setCurrentPage(0)
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