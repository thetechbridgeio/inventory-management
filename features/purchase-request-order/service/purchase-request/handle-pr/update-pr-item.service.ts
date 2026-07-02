import { eq } from "drizzle-orm";

import { purchaseRequestItems } from "@/db/schema";
import { PurchaseRequestItemStatus } from "../../../constants/purchase-request-item-status";
import { Tx } from "./get-pr-items.service";


type PurchaseRequestItemUpdate = {
  id: string;
  status: PurchaseRequestItemStatus;
  approvedQty: number;
  supplierId: string | null;
};

export async function updatePurchaseRequestItems(
  tx: Tx,
  itemUpdates: PurchaseRequestItemUpdate[],
) {
  if (itemUpdates.length === 0) {
    return;
  }

  await Promise.all(
    itemUpdates.map((item) =>
      tx
        .update(purchaseRequestItems)
        .set({
          status: item.status,
          approvedQty: item.approvedQty,
          supplierId: item.supplierId,
          updatedAt: new Date(),
        })
        .where(eq(purchaseRequestItems.id, item.id)),
    ),
  );
}