import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { saleReturns } from "../schemas/sale-return.schema";
import { SALE_RETURN_STATUS } from "../constants/sale-return-status";

export async function rejectSaleReturn(
  returnId: string,
  companyId: string,
  approvedByUserId: string,
  rejectionReason?: string | null,
) {
  try {
    return await db.transaction(async (tx) => {
      const saleReturn = await tx.query.saleReturns.findFirst({
        where: and(
          eq(saleReturns.id, returnId),
          eq(saleReturns.companyId, companyId),
        ),

        columns: {
          id: true,
          status: true,
        },
      });

      if (!saleReturn) {
        throw new NotFoundError("Return request not found");
      }

      if (saleReturn.status !== SALE_RETURN_STATUS.PENDING_APPROVAL) {
        throw new BusinessRuleError(
          "Only pending return requests can be rejected.",
        );
      }

      const [updated] = await tx
        .update(saleReturns)
        .set({
          status: SALE_RETURN_STATUS.REJECTED,
          approvedByUserId,
          approvedAt: new Date(),
          rejectionReason: rejectionReason?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(saleReturns.id, returnId))
        .returning();

      return updated;
    });
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof BusinessRuleError) {
      throw error;
    }

    throw mapDatabaseError(error);
  }
}
