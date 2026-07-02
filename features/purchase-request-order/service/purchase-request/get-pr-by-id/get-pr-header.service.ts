import { db } from "@/db";
import { purchaseRequests, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

const createdByUser = alias(users, "createdByUser");
const processedByUser = alias(users, "processedByUser");

export async function getPurchaseRequestHeader(
  companyId: string,
  purchaseRequestId: string,
) {
  const [purchaseRequest] = await db
    .select({
      id: purchaseRequests.id,
      purchaseRequestNumber: purchaseRequests.purchaseRequestNumber,
      status: purchaseRequests.status,
      remarks: purchaseRequests.remarks,
      totalItems: purchaseRequests.totalItems,
      totalRequestedQty: purchaseRequests.totalRequestedQty,

      createdByUserId: purchaseRequests.createdByUserId,
      createdByUserName: createdByUser.name,

      processedByUserId: purchaseRequests.processedByUserId,
      processedByUserName: processedByUser.name,

      processedAt: purchaseRequests.processedAt,
      createdAt: purchaseRequests.createdAt,
      updatedAt: purchaseRequests.updatedAt,
    })
    .from(purchaseRequests)
    .leftJoin(
      createdByUser,
      eq(createdByUser.id, purchaseRequests.createdByUserId),
    )
    .leftJoin(
      processedByUser,
      eq(processedByUser.id, purchaseRequests.processedByUserId),
    )
    .where(
      and(
        eq(purchaseRequests.companyId, companyId),
        eq(purchaseRequests.id, purchaseRequestId),
      ),
    );

  return purchaseRequest;
}
