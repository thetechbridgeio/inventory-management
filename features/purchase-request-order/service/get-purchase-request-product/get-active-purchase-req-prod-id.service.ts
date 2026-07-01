import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { purchaseRequestItems, purchaseRequests } from "@/db/schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { PURCHASE_REQUEST_ITEM_STATUS } from "../../constants/purchase-request-item-status";
import { PURCHASE_REQUEST_STATUS } from "../../constants/purchase-request-status";

/**
 * Returns product IDs that are currently part of an active Purchase Request.
 * These products should be excluded from creating a new Purchase Request.
 */
export async function getActivePurchaseRequestProductIds(
  companyId: string,
): Promise<string[]> {
  try {
    const rows = await db
      .select({
        productId: purchaseRequestItems.productId,
      })
      .from(purchaseRequestItems)
      .innerJoin(
        purchaseRequests,
        eq(purchaseRequestItems.purchaseRequestId, purchaseRequests.id),
      )
      .where(
        and(
          eq(purchaseRequests.companyId, companyId),
          inArray(purchaseRequests.status, [
            PURCHASE_REQUEST_STATUS.PENDING_APPROVAL,
            PURCHASE_REQUEST_STATUS.PARTIALLY_APPROVED,
          ]),
          inArray(purchaseRequestItems.status, [
            PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL,
            PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED,
          ]),
        ),
      );

    return [...new Set(rows.map((row) => row.productId))];
  } catch (error) {
    console.error(
      "Failed to fetch active Purchase Request product IDs:",
      error,
    );

    throw mapDatabaseError(
      "Unable to fetch active Purchase Request product IDs.",
    );
  }
}