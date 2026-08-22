"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, MoreHorizontal, ShieldCheck, Trash2, Undo2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DeleteSaleDialog } from "../delete-sale-dialog";
import { ViewSaleDialog } from "../view-sale-dialog";
import { CreateReturnDialog } from "@/features/returns/components/create-return-dialog";
import { can } from "@/features/auth/constants/permissions";
import { UserRole } from "@/features/auth/constants/user-role";
import {
  SALE_RETURN_FLAG_CONFIG,
  SaleReturnFlag,
} from "../../constants/sale-return-flag";

export type SaleRow = {
  id: string;
  soldTo: string;
  saleNumber: string;
  saleDate: string;
  grandTotal: number;
  createdAt: string;
  itemsCount: number;
  returnFlag: SaleReturnFlag | null;
  isWarranty: boolean;
};

export function getSaleColumns(role?: UserRole): ColumnDef<SaleRow>[] {
  return [
    {
      accessorKey: "saleNumber",
      header: "Sale #",
      cell: ({ row }) => {
        const returnFlag = row.original.returnFlag;
        const flagConfig = returnFlag
          ? SALE_RETURN_FLAG_CONFIG[returnFlag]
          : null;

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium">
              {row.original.saleNumber}
            </span>

            {row.original.isWarranty && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </TooltipTrigger>
                <TooltipContent>Under warranty</TooltipContent>
              </Tooltip>
            )}

            {flagConfig && (
              <Badge variant="outline" className={flagConfig.className}>
                {flagConfig.label}
              </Badge>
            )}
          </div>
        );
      },
    },

    {
      accessorKey: "saleDate",
      header: "Sale Date",
      cell: ({ row }) => format(new Date(row.original.saleDate), "dd MMM yyyy"),
    },
    {
      accessorKey: "customer",
      header: "Customer Name",
      cell: ({ row }) => row.original.soldTo ?? "-",
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

        const canDelete = can(role, "sale:delete");
        const canReturn = can(role, "return:create");

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

              {canReturn && (
                <CreateReturnDialog
                  saleId={sale.id}
                  saleNumber={sale.saleNumber}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Undo2 className="mr-2 h-4 w-4" />
                    Return
                  </DropdownMenuItem>
                </CreateReturnDialog>
              )}

              {canDelete && (
                <DeleteSaleDialog saleId={sale.id} saleNumber={sale.saleNumber}>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DeleteSaleDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
