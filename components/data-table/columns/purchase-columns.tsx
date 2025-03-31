"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PurchaseItem } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

export const purchaseColumns: ColumnDef<PurchaseItem>[] = [
  {
    id: "select",
    header: "Select",
  },
  {
    accessorKey: "srNo",
    header: "Sr. No",
    // The cell rendering is now handled by the DataTable component
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]" title={row.original.product || "Unknown Product"}>
        {row.original.product || "Unknown Product"}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div>{row.original.quantity || 0}</div>,
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <div className="text-muted-foreground">{row.original.unit || "N/A"}</div>,
  },
  {
    accessorKey: "poNumber",
    header: "PO Number",
    cell: ({ row }) => <div>{row.original.poNumber || "N/A"}</div>,
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => <div>{row.original.supplier || "N/A"}</div>,
  },
  {
    accessorKey: "dateOfReceiving",
    header: "Date Received",
    cell: ({ row }) => {
      // Get the raw date string directly from the row data
      const dateString = row.original.dateOfReceiving || ""

      // If empty, show "Not set"
      if (!dateString) {
        return <div>Not set</div>
      }

      // Try to parse as a date
      try {
        const date = new Date(dateString)

        // Check if it's a valid date
        if (!isNaN(date.getTime())) {
          // Format only if it's a valid date
          const formatted = format(date, "MMM d, yyyy")
          return <div>{formatted}</div>
        } else {
          // If invalid date, just show the original string
          return <div>{dateString}</div>
        }
      } catch (error) {
        // On any error, show the original string
        return <div>{dateString}</div>
      }
    },
  },
  {
    accessorKey: "rackNumber",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.rackNumber || "N/A"
      return <div>{location}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

