"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { DeleteProductDialog } from "../delete-product-dialog";
import { ViewProductDialog } from "../view-product-dialog";
import { AddSupplierToProductDialog } from "../add-product-supplier-dialog";

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  currentStock: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  reorderQty: number;
  location: string | null;
};

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        {row.original.description && (
          <p className="text-muted-foreground text-xs">
            {row.original.description}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",

    cell: ({ row }) => {
      const category = row.original.category;

      if (category === "RAW") {
        return (
          <Badge
            className="
            border-blue-200
            bg-blue-100
            text-blue-700
            hover:bg-blue-100
          "
          >
            Raw Material
          </Badge>
        );
      }

      if (category === "FINISHED") {
        return (
          <Badge
            className="
            border-emerald-200
            bg-emerald-100
            text-emerald-700
            hover:bg-emerald-100
          "
          >
            Finished Product
          </Badge>
        );
      }

      return (
        <Badge
          className="
          border-purple-200
          bg-purple-100
          text-purple-700
          hover:bg-purple-100
        "
        >
          Spare Part
        </Badge>
      );
    },
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "currentStock",
    header: "Stock",
    cell: ({ row }) => (
      <div>
        <span>{row.original.currentStock}</span>
        <div className="text-muted-foreground flex gap-3 text-xs">
          <span>Min: {row.original.minOrderQty}</span>
          <span>Max: {row.original.maxOrderQty ?? "-"}</span>
        </div>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const stock = row.original.currentStock;
      const minOrderQty = row.original.minOrderQty;

      if (stock <= 0) {
        return (
          <Badge
            className="
        border-red-200
        bg-red-100
        text-red-700
        hover:bg-red-100
      "
          >
            Out of Stock
          </Badge>
        );
      }

      if (stock <= minOrderQty) {
        return (
          <Badge
            className="
        border-amber-200
        bg-amber-100
        text-amber-700
        hover:bg-amber-100
      "
          >
            Low Stock
          </Badge>
        );
      }

      return (
        <Badge
          className="
      border-green-200
      bg-green-100
      text-green-700
      hover:bg-green-100
    "
        >
          Healthy
        </Badge>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <ViewProductDialog productId={product.id}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            </ViewProductDialog>
            <AddSupplierToProductDialog productId={product.id}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </DropdownMenuItem>
            </AddSupplierToProductDialog>

            <DeleteProductDialog
              productId={product.id}
              productName={product.name}
            >
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteProductDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
