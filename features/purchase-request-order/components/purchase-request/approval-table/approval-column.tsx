import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

import { CategoryBadge } from "@/lib/category-badge";

import {
  PurchaseRequestApprovalForm,
  ViewPurchaseRequestProduct,
} from "@/features/purchase-request-order/types/purchase-request.type";

import { SupplierCell } from "../data-table/supplier-cell";
import { ApprovedQtyCell } from "./approved-qty-cell";

export const approvalColumns: ColumnDef<ViewPurchaseRequestProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-semibold leading-none">{row.original.productName}</p>

        {row.original.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
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
    accessorKey: "currentStock",
    header: "Current Stock",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">
          {row.original.currentStock} {row.original.unit}
        </p>

        <p className="text-muted-foreground text-xs">
          Min: {row.original.minOrderQty} • Max:{" "}
          {row.original.maxOrderQty ?? "-"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "requestedQty",
    header: "Requested Qty",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.requestedQty}</span>
    ),
  },
  {
    accessorKey: "approvedQty",
    header: "Approved Qty",
    cell: ({ row }) => (
      <ApprovedQtyCell<PurchaseRequestApprovalForm>
        approvedQtyName={`purchaseRequestItems.${row.index}.approvedQty`}
      />
    ),
  },
  {
    accessorKey: "supplierId",
    header: "Supplier",
    cell: ({ row }) => (
      <SupplierCell<PurchaseRequestApprovalForm>
        baseName={`purchaseRequestItems.${row.index}`}
      />
    ),
  },
];
