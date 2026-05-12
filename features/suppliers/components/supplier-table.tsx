// features/suppliers/components/supplier-table.tsx

"use client"

import { useMemo, useState } from "react"

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Supplier } from "../types/supplier.types"
import { EditSupplierDialog } from "./edit-suppplier-dialog"
import { useSuppliersContext } from "../context/supplier-provider"

const ITEMS_PER_PAGE = 10

export function SupplierTable() {
  const { suppliers, loading, deleting, deleteSupplier } = useSuppliersContext()

  const [search, setSearch] = useState("")

  const [currentPage, setCurrentPage] = useState(1)

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const searchable = `${supplier.companyName}
             ${supplier.phoneNumber}
             ${supplier.emailId}`.toLowerCase()

      return searchable.includes(search.toLowerCase())
    })
  }, [suppliers, search])

  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE)

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE

    return filteredSuppliers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredSuppliers, currentPage])

  const handleDelete = async (supplier: Supplier) => {
    try {
      console.log("Deleting supplier:", supplier) // Debug log
      await deleteSupplier(supplier)
    } catch (error) {
      console.error(error)

      toast.error("Failed to delete supplier")
    }
  }

  return (
    <div className="space-y-5">
      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-14 min-w-65 font-semibold">
                  Company
                </TableHead>

                <TableHead className="min-w-65 font-semibold">
                  Contact
                </TableHead>

                <TableHead className="min-w-45 font-semibold">
                  Payment Terms
                </TableHead>

                <TableHead className="min-w-45 font-semibold">
                  Est Delivery
                </TableHead>

                <TableHead className="w-35 text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* LOADING */}
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading suppliers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedSuppliers.length === 0 ? (
                /* EMPTY */
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="space-y-1">
                      <p className="font-medium">No suppliers found</p>

                      <p className="text-sm text-muted-foreground">
                        Try changing your search keyword.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSuppliers.map((supplier, index) => (
                  <TableRow
                    key={`${supplier.companyName}-${index}`}
                    className={index % 2 === 0 ? "bg-white" : "bg-muted/20"}
                  >
                    {/* COMPANY */}
                    <TableCell>
                      <div className="space-y-2">
                        <p className="font-semibold tracking-tight">
                          {supplier.companyName}
                        </p>

                        {supplier.sentAutomatedOrder && (
                          <Badge className="rounded-md bg-green-100 text-green-800 hover:bg-green-200">
                            Automate Orders
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* CONTACT */}
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {supplier.phoneNumber}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {supplier.emailId}
                        </p>
                      </div>
                    </TableCell>

                    {/* PAYMENT */}
                    <TableCell>
                      <p className="font-medium">{supplier.paymentTerms}</p>
                    </TableCell>

                    {/* DELIVERY */}
                    <TableCell>
                      <p className="font-medium">
                        {supplier.estimatedDeliveryPeriod}
                      </p>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {/* EDIT */}
                        <EditSupplierDialog supplier={supplier} />
                        {/* DELETE */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="rounded-3xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Supplier
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently remove{" "}
                                <span className="font-medium text-black">
                                  {supplier.companyName}
                                </span>{" "}
                                from your supplier list.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => handleDelete(supplier)}
                                className="rounded-xl bg-red-600 hover:bg-red-700"
                                disabled={deleting}
                              >
                                {deleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete Supplier"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        {filteredSuppliers.length > 10 && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-black">
                {paginatedSuppliers.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-black">
                {filteredSuppliers.length}
              </span>{" "}
              suppliers
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="rounded-xl"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="rounded-xl border px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                size="icon"
                variant="outline"
                className="rounded-xl"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
