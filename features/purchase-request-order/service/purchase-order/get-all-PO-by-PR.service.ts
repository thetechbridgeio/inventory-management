import { db } from "@/db";
import { purchaseOrders, suppliers } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

type Props = {
  companyId: string;
  purchaseRequestId: string;
};

export async function getPurchaseOrdersByPurchaseRequest({
  companyId,
  purchaseRequestId,
}: Props) {
  return await db
    .select({
      id: purchaseOrders.id,
      purchaseOrderNumber: purchaseOrders.purchaseOrderNumber,
      status: purchaseOrders.status,
      totalItems: purchaseOrders.totalItems,
      totalOrderedQty: purchaseOrders.totalOrderedQty,
      remarks: purchaseOrders.remarks,
      createdAt: purchaseOrders.createdAt,
      supplierId: suppliers.id,
      supplierName: suppliers.companyName,
    })
    .from(purchaseOrders)
    .innerJoin(
      suppliers,
      eq(suppliers.id, purchaseOrders.supplierId),
    )
    .where(
      and(
        eq(purchaseOrders.companyId, companyId),
        eq(purchaseOrders.purchaseRequestId, purchaseRequestId),
      ),
    )
    .orderBy(asc(purchaseOrders.createdAt));
}