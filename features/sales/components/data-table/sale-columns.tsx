"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteSaleDialog } from "../delete-sale-dialog";
import { ViewSaleDialog } from "../view-sale-dialog";

export type SaleRow = {
  id: string;
  saleNumber: string;
  saleDate: string;
  grandTotal: number;
  createdAt: string;
  itemsCount: number;
};

export const saleColumns: ColumnDef<SaleRow>[] = [
  {
    accessorKey: "saleNumber",
    header: "Sale #",
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.saleNumber}</span>
    ),
  },

  {
    accessorKey: "saleDate",
    header: "Sale Date",
    cell: ({ row }) => format(new Date(row.original.saleDate), "dd MMM yyyy"),
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
        ₹
        {row.original.grandTotal.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
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
      const sale = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <ViewSaleDialog saleId={sale.id}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
            </ViewSaleDialog>

            <DeleteSaleDialog saleId={sale.id} saleNumber={sale.saleNumber}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DeleteSaleDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
