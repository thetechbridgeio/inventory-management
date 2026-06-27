import "server-only";

import { db } from "@/db";

import { generatePurchaseRequestNumber } from "./generate-purchase-request-number";
import { purchaseRequests } from "../schemas/purchase-request.schema";
import { purchaseRequestItems } from "../schemas/purchase-request-item.schema";
import { ValidationError } from "@/lib/errors";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { PurchaseRequestForm } from "../validation/purchase-request-form";

export async function createPurchaseRequest(
  data: PurchaseRequestForm,
  companyId: string,
  createdByUserId: string,
) {
  try {
    if (data.items.length === 0) {
      throw new ValidationError(
        "Must contain atleast one low/out of stock product",
      );
    }

    const validItems = data.items.filter((item) => item.requestedQty > 0);

    if (validItems.length === 0) {
      throw new ValidationError(
        "Purchase Request must contain at least one item with quantity greater than zero.",
      );
    }

    const productIds = new Set<string>();

    for (const item of validItems) {
      if (productIds.has(item.productId)) {
        throw new ValidationError(
          "Duplicate products are not allowed in a Purchase Request.",
        );
      }

      productIds.add(item.productId);
    }

    return db.transaction(async (tx) => {
      const requestNumber = await generatePurchaseRequestNumber(tx, companyId);

      const [purchaseRequest] = await tx
        .insert(purchaseRequests)
        .values({
          companyId,
          requestNumber,
          remarks: data.remarks,
          createdByUserId,
        })
        .returning();

      await tx.insert(purchaseRequestItems).values(
        validItems.map((item) => ({
          purchaseRequestId: purchaseRequest.id,
          productId: item.productId,
          supplierId: item.supplierId || null,
          requestedQty: item.requestedQty,
        })),
      );

      return purchaseRequest;
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}
