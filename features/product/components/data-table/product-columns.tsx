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
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { DeleteProductDialog } from "../delete-product-dialog";
import { ViewProductDialog } from "../view-product-dialog";
import { AddSupplierToProductDialog } from "../add-product-supplier-dialog";
import Link from "next/link";

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

      return <Badge variant="outline">{category || "Uncategorized"}</Badge>;
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
      const minOrderQty = row.original.minOrderQty ?? 0;
      const maxOrderQty = row.original.maxOrderQty ?? Infinity;

      if (stock <= minOrderQty) {
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-200">
            Low
          </Badge>
        );
      }

      if (stock >= maxOrderQty) {
        return (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
            Excess
          </Badge>
        );
      }

      return (
        <Badge className="bg-green-100 text-green-700 border border-green-200">
          Normal
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
            {/* <DropdownMenuItem>
              <Link
                className="flex p-0.5"
                href={`/inventory/update/${product.id}`}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Update
              </Link>
            </DropdownMenuItem> */}
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
