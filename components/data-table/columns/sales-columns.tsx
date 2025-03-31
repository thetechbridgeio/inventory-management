"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SalesItem } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

export const salesColumns: ColumnDef<SalesItem>[] = [
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
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => <div>{row.original.contact || "N/A"}</div>,
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => <div>{row.original.companyName || "N/A"}</div>,
  },
  {
    accessorKey: "dateOfIssue",
    header: "Date Issued",
    cell: ({ row }) => {
      const dateString = row.original.dateOfIssue || ""

      if (!dateString) {
        return <div>Not set</div>
      }

      try {
        const date = new Date(dateString)

        if (!isNaN(date.getTime())) {
          const formatted = format(date, "MMM d, yyyy")
          return <div>{formatted}</div>
        } else {
          return <div>{dateString}</div>
        }
      } catch (error) {
        return <div>{dateString}</div>
      }
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

