import { purchaseOrderItems, purchaseOrders } from "@/db/schema";


import { PURCHASE_ORDER_STATUS } from "../../../constants/purchase-order-status";
import { Tx } from "./get-pr-items.service";
import { generatePurchaseOrderNumber } from "../../purchase-order/generate-PO-number";

type ApprovedPRItem = {
  purchaseRequestItemId: string;
  productId: string;
  supplierId: string;
  approvedQty: number;
};

export async function generatePurchaseOrders(
  tx: Tx,
  companyId: string,
  purchaseRequestId: string,
  createdByUserId: string,
  approvedItems: ApprovedPRItem[],
) {
  if (approvedItems.length === 0) {
    return [];
  }

  const supplierGroups = new Map<string, ApprovedPRItem[]>();

  for (const item of approvedItems) {
    const existing = supplierGroups.get(item.supplierId);

    if (existing) {
      existing.push(item);
    } else {
      supplierGroups.set(item.supplierId, [item]);
    }
  }

  const purchaseOrdersCreated = [];

  for (const [supplierId, items] of supplierGroups) {
    const purchaseOrderNumber = await generatePurchaseOrderNumber(
      tx,
      companyId,
    );

    const [purchaseOrder] = await tx
      .insert(purchaseOrders)
      .values({
        companyId,
        purchaseOrderNumber,
        purchaseRequestId,
        supplierId,
        createdByUserId,
        totalItems: items.length,
        totalOrderedQty: items.reduce(
          (sum, item) => sum + item.approvedQty,
          0,
        ),
        status: PURCHASE_ORDER_STATUS.EMAIL_PENDING,
      })
      .returning();

    await tx.insert(purchaseOrderItems).values(
      items.map((item) => ({
        purchaseOrderId: purchaseOrder.id,
        purchaseRequestItemId: item.purchaseRequestItemId,
        productId: item.productId,
        orderedQty: item.approvedQty,
      })),
    );

    purchaseOrdersCreated.push(purchaseOrder);
  }

  return purchaseOrdersCreated;
}