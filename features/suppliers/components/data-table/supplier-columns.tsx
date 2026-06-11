"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenu } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Plus, Trash2 } from "lucide-react";
import { DeleteSupplierDialog } from "../delete-supplier-dialog";
import { ViewSupplierDialog } from "../view-supplier-dialog";

export type SupplierRow = {
  id: string;
  companyName: string;
  contactPersonName: string;
  email: string;
  estimatedDeliveryPeriod: number | null;
  paymentTerm: string | null;
  isActive: boolean;
};

export const supplierColumns: ColumnDef<SupplierRow>[] =
  [
    {
      accessorKey: "companyName",
      header: "Company",
    },

    {
      accessorKey:
        "contactPersonName",
      header: "Contact",
    },

    {
      accessorKey: "email",
      header: "Email",
    },

    {
      accessorKey:
        "estimatedDeliveryPeriod",
      header: "Delivery",
      cell: ({ row }) =>
        `${row.original.estimatedDeliveryPeriod ?? "-"} days`,
    },
    {
        accessorKey: "paymentTerm",
        header: "Payment Term"
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.isActive
              ? "default"
              : "secondary"
          }
        >
          {row.original.isActive
            ? "Active"
            : "Inactive"}
        </Badge>
      ),
    },
    {
  id: "actions",
  header: "Actions",
  enableSorting: false,
  cell: ({ row }) => {
    const supplier = row.original;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <ViewSupplierDialog supplierId={supplier.id}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          </ViewSupplierDialog>

          <DeleteSupplierDialog
            supplierId={supplier.id}
            supplierName={supplier.companyName}
          >
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DeleteSupplierDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
}
  ];