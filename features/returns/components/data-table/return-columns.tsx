"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SALE_RETURN_STATUS_CONFIG } from "../../constants/sale-return-status";
import { ViewReturnDialog } from "../view-return-dialog";

export type SaleReturnRow = {
  id: string;
  returnNumber: string;
  soldTo: string;
  saleId: string;
  saleNumber: string;
  returnDate: string;
  status: keyof typeof SALE_RETURN_STATUS_CONFIG;
  totalItems: number;
  totalReturnedQty: number;
  createdAt: string;
};

export function getReturnColumns(): ColumnDef<SaleReturnRow>[] {
  return [
    {
      accessorKey: "returnNumber",
      header: "Return #",
      cell: ({ row }) => (
        <span className="font-mono font-medium">
          {row.original.returnNumber}
        </span>
      ),
    },

    {
      accessorKey: "saleNumber",
      header: "Sale",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.saleNumber}<br/>{row.original.soldTo ?? "-"}
        </span>
      ),
    },

    {
      accessorKey: "returnDate",
      header: "Return Date",
      cell: ({ row }) =>
        format(new Date(row.original.returnDate), "dd MMM yyyy"),
    },

    {
      accessorKey: "totalReturnedQty",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary">{row.original.totalReturnedQty}</Badge>
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = SALE_RETURN_STATUS_CONFIG[row.original.status];

        return (
          <Badge variant="outline" className={config.className}>
            {config.label}
          </Badge>
        );
      },
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
        const saleReturn = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <ViewReturnDialog returnId={saleReturn.id}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              </ViewReturnDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
