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
import {
  ArrowDown,
  ArrowUp,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  View,
} from "lucide-react";
import { DeleteProductDialog } from "../delete-product-dialog";
import { ViewProductDialog } from "../view-product-dialog";
import { AddSupplierToProductDialog } from "../add-product-supplier-dialog";
import Link from "next/link";
import { Product } from "../../types/product.types";
import { can } from "@/features/auth/constants/permissions";
import { UserRole } from "@/features/auth/constants/user-role";
import { CategoryBadge } from "@/lib/category-badge";
import { getStockStatus } from "./get-stock-status";
import {
  STOCK_STATUS_BADGES,
  STOCK_STATUS_LABELS,
} from "../../constants/product-stock-status";

export function getProductColumns(
  role?: UserRole,
  createdAtSortOrder: "asc" | "desc" = "desc",
  onToggleCreatedAtSort?: () => void,
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "name",
      header: () => (
        <button
          type="button"
          onClick={onToggleCreatedAtSort}
          className="hover:text-foreground flex items-center gap-1"
          title={
            createdAtSortOrder === "asc"
              ? "Showing oldest first — click to show newest first"
              : "Showing newest first — click to show oldest first"
          }
        >
          Product
          {createdAtSortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )}
        </button>
      ),
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
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
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
        const status = getStockStatus(
          row.original.currentStock,
          row.original.minOrderQty ?? 0,
          row.original.maxOrderQty ?? Infinity,
        );

        return (
          <Badge className={STOCK_STATUS_BADGES[status]}>
            {STOCK_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "unitCost",
      header: "Price per Unit",
      cell: ({ row }) => {
        const unitCost = row.original.unitCost;

        return (
          <span>
            {unitCost != null ? `₹${Number(unitCost).toFixed(2)}` : "N/A"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const product = row.original;
        const canUpdate = can(role, "product:update");

        const canDelete = can(role, "product:delete");

        const canAddSupplier = can(role, "product:add-supplier");

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
              <DropdownMenuItem asChild>
                <Link
                  href={`/inventory/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <View className="mr-2 h-4 w-4" /> View Detail
                </Link>
              </DropdownMenuItem>

              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link
                    href={`/inventory/update/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Update
                  </Link>
                </DropdownMenuItem>
              )}

              {/* {canAddSupplier && (
                <AddSupplierToProductDialog productId={product.id}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </DropdownMenuItem>
                </AddSupplierToProductDialog>
              )} */}

              {canDelete && (
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
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
