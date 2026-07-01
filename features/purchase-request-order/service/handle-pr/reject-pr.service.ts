import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { purchaseRequests, purchaseRequestItems } from "@/db/schema";
import { PURCHASE_REQUEST_ITEM_STATUS } from "../../constants/purchase-request-item-status";
import { PURCHASE_REQUEST_STATUS } from "../../constants/purchase-request-status";

export async function rejectPurchaseRequest(
  companyId: string,
  purchaseRequestId: string,
): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      const purchaseRequest = await tx.query.purchaseRequests.findFirst({
        where: and(
          eq(purchaseRequests.id, purchaseRequestId),
          eq(purchaseRequests.companyId, companyId),
        ),
      });

      if (!purchaseRequest) {
        throw new Error("Purchase request not found.");
      }

      if (
        purchaseRequest.status !== PURCHASE_REQUEST_STATUS.PENDING_APPROVAL &&
        purchaseRequest.status !== PURCHASE_REQUEST_STATUS.APPROVED
      ) {
        throw new Error("This purchase request cannot be rejected.");
      }

      const items = await tx.query.purchaseRequestItems.findMany({
        where: eq(purchaseRequestItems.purchaseRequestId, purchaseRequestId),
      });

      if (
        items.some(
          (item) => item.status === PURCHASE_REQUEST_ITEM_STATUS.APPROVED,
        )
      ) {
        throw new Error(
          "Cannot reject a purchase request that contains approved items.",
        );
      }

      await tx
        .update(purchaseRequests)
        .set({
          status: PURCHASE_REQUEST_STATUS.REJECTED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(purchaseRequests.id, purchaseRequestId),
            eq(purchaseRequests.companyId, companyId),
          ),
        );

      await tx
        .update(purchaseRequestItems)
        .set({
          status: PURCHASE_REQUEST_ITEM_STATUS.REJECTED,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(purchaseRequestItems.purchaseRequestId, purchaseRequestId),
            eq(
              purchaseRequestItems.status,
              PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL,
            ),
          ),
        );
    });
  } catch (error) {
    throw mapDatabaseError(error);
  }
}
