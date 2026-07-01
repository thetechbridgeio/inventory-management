import { eq } from "drizzle-orm";

import { purchaseRequests } from "@/db/schema";
import { Tx } from "./get-pr-items.service";
import { PurchaseRequestStatus } from "../../constants/purchase-request-status";

export async function updatePurchaseRequestStatus(
  tx: Tx,
  purchaseRequestId: string,
  status: PurchaseRequestStatus,
) {
  await tx
    .update(purchaseRequests)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, purchaseRequestId));
}