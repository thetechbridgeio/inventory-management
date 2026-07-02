import { and, eq } from "drizzle-orm";

import { purchaseRequestItems, purchaseRequests } from "@/db/schema";
import { Tx } from "./get-pr-items.service";
import { PURCHASE_REQUEST_ITEM_STATUS } from "../../../constants/purchase-request-item-status";
import { PURCHASE_REQUEST_STATUS } from "../../../constants/purchase-request-status";

export async function updatePurchaseRequestStatus(
  tx: Tx,
  purchaseRequestId: string,
  processedByUserId: string,
) {
  const items = await tx.query.purchaseRequestItems.findMany({
    where: eq(purchaseRequestItems.purchaseRequestId, purchaseRequestId),
    columns: {
      status: true,
    },
  });

  const allApproved = items.every(
    (item) => item.status === PURCHASE_REQUEST_ITEM_STATUS.APPROVED,
  );

  const allRejected = items.every(
    (item) => item.status === PURCHASE_REQUEST_ITEM_STATUS.REJECTED,
  );

  const status = allApproved
    ? PURCHASE_REQUEST_STATUS.APPROVED
    : allRejected
      ? PURCHASE_REQUEST_STATUS.REJECTED
      : PURCHASE_REQUEST_STATUS.PARTIALLY_APPROVED;

  await tx
    .update(purchaseRequests)
    .set({
      status,
      processedByUserId,
      updatedAt: new Date(),
    })
    .where(eq(purchaseRequests.id, purchaseRequestId));
}