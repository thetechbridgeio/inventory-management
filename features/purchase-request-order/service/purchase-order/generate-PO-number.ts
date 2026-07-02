import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { purchaseOrders } from "../../schemas/purchase-order.schema";

type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

export async function generatePurchaseOrderNumber(
  tx: Tx,
  companyId: string,
) {
  const lastPurchaseOrder = await tx.query.purchaseOrders.findFirst({
    where: eq(purchaseOrders.companyId, companyId),
    columns: {
      purchaseOrderNumber: true,
    },
    orderBy: desc(purchaseOrders.purchaseOrderNumber),
  });

  if (!lastPurchaseOrder) {
    return "PO-000001";
  }

  const lastNumber = Number(
    lastPurchaseOrder.purchaseOrderNumber.replace("PO-", ""),
  );

  return `PO-${String(lastNumber + 1).padStart(6, "0")}`;
}