"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DeletePurchaseDialog } from "../delete-purchase-dialog";
import { ViewPurchaseDialog } from "../view-purchase-dialog";
import { ROLES } from "@/features/auth/constants/user-role";

export type PurchaseRow = {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierName: string;
  grandTotal: number;
  createdAt: string;
  itemsCount: number;
};

export function getPurchaseColumns(
  role?: string
): ColumnDef<PurchaseRow>[] {
  return [
    {
      accessorKey: "purchaseNumber",
      header: "Purchase #",
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.purchaseNumber}
        </span>
      ),
    },

    {
      accessorKey: "supplierName",
      header: "Supplier",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.supplierName}</div>
      ),
    },

    {
      accessorKey: "purchaseDate",
      header: "Purchase Date",
      cell: ({ row }) =>
        format(new Date(row.original.purchaseDate), "dd MMM yyyy"),
    },

    {
      accessorKey: "itemsCount",
      header: () => <div className="text-center">Items</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary">{row.original.itemsCount}</Badge>
        </div>
      ),
    },

    {
      accessorKey: "grandTotal",
      header: () => <div className="text-right">Grand Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ₹{row.original.grandTotal.toLocaleString("en-IN")}
        </div>
      ),
    },

    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "dd MMM yyyy, hh:mm a"),
    },

    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => {
        const purchase = row.original;

        const canDelete =
          role === ROLES.SUPER_ADMIN ||
          role === ROLES.PURCHASE_ADMIN;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <ViewPurchaseDialog purchaseId={purchase.id}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              </ViewPurchaseDialog>

              {canDelete && (
                <DeletePurchaseDialog
                  purchaseId={purchase.id}
                  purchaseNumber={purchase.purchaseNumber}
                >
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DeletePurchaseDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}