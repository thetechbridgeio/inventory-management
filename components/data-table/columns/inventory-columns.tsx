"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { InventoryItem } from "@/lib/types"
import { getStockStatus, formatCurrency } from "@/lib/utils"

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
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
    cell: ({ row }) => {
      const product = row.original.product || "Unknown Product"
      return (
        <div className="font-medium truncate max-w-[200px]" title={product}>
          {product}
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category || "Uncategorized"
      return (
        <Badge variant="outline" className="font-normal">
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => {
      const unit = row.original.unit || "N/A"
      return <div className="text-muted-foreground">{unit}</div>
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock ?? 0
      return <div className="font-medium text-center w-full">{stock}</div>
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const item = row.original
      const status = getStockStatus(item)

      const getStatusStyle = () => {
        switch (status) {
          case "negative":
            return {
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              hoverBg: "#fecaca",
            }
          case "low":
            return {
              backgroundColor: "#f5cbcc",
              color: "#7d3f3f",
              hoverBg: "#edbdbe",
            }
          case "normal":
            return {
              backgroundColor: "#d9ead3",
              color: "#3d6e36",
              hoverBg: "#c8e0bf",
            }
          case "excess":
            return {
              backgroundColor: "#c5d7e7",
              color: "#3b5875",
              hoverBg: "#b4c9dc",
            }
          default:
            return {
              backgroundColor: "#d9ead3",
              color: "#3d6e36",
              hoverBg: "#c8e0bf",
            }
        }
      }

      const statusStyle = getStatusStyle()

      return (
        <div className="flex justify-center w-full">
          <Badge
            variant="outline"
            className="min-w-[80px] text-center justify-center border-0 font-medium"
            style={{
              backgroundColor: statusStyle.backgroundColor,
              color: statusStyle.color,
            }}
          >
            {status === "negative" ? "negative" : status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "pricePerUnit",
    header: "Price",
    cell: ({ row }) => {
      // Handle potentially undefined pricePerUnit
      const pricePerUnit = row.original.pricePerUnit
      const amount = pricePerUnit !== undefined ? Number.parseFloat(pricePerUnit.toString()) : 0
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      // Handle potentially undefined value
      const value = row.original.value
      const amount = value !== undefined ? Number.parseFloat(value.toString()) : 0
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
]

