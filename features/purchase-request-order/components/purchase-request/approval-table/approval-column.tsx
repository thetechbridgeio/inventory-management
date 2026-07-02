import { ColumnDef } from "@tanstack/react-table";

import { CategoryBadge } from "@/lib/category-badge";

import {
  PurchaseRequestApprovalForm,
  ViewPurchaseRequestProduct,
} from "@/features/purchase-request-order/types/purchase-request.type";

import { ApprovedQtyCell } from "./approved-qty-cell";
import { DecisionCell } from "./decision-cell";
import { SupplierCellApproval } from "./supplier-cell-approval";

export const approvalColumns: ColumnDef<ViewPurchaseRequestProduct>[] = [
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-semibold leading-none">
          {row.original.productName}
        </p>

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
    cell: ({ row }) => (
      <CategoryBadge category={row.original.category} />
    ),
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
      <span className="font-medium">
        {row.original.requestedQty}
      </span>
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
      <SupplierCellApproval<PurchaseRequestApprovalForm>
        baseName={`purchaseRequestItems.${row.index}`}
      />
    ),
  },
  {
    id: "decision",
    header: "Decision",
    cell: ({ row }) => (
      <DecisionCell<PurchaseRequestApprovalForm>
        baseName={`purchaseRequestItems.${row.index}`}
      />
    ),
    size: 220,
  },
];