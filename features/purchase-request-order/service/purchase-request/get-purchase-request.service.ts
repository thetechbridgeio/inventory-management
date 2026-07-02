import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";

import { purchaseRequests } from "../../schemas/purchase-request.schema";
import { users } from "@/features/users/schemas/user.schema";

import { AuthorizationError } from "@/lib/errors/authorization-error";
import { ValidationError } from "@/lib/errors/validation-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

const createdByUser = alias(users, "createdByUser");
const processedByUser = alias(users, "processedByUser");

export async function getPurchaseRequests(companyId: string) {
  try {
    if (!companyId) {
      throw new ValidationError("Company ID is required.");
    }

    const purchaseRequestList = await db
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
      .where(eq(purchaseRequests.companyId, companyId))
      .orderBy(desc(purchaseRequests.createdAt));

    return purchaseRequestList;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof AuthorizationError
    ) {
      throw error;
    }

    throw mapDatabaseError(error);
  }
}
