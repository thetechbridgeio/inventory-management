import "server-only";

import { db } from "@/db";

import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { generatePurchaseRequestNumber } from "./generate-PR-number";
import { purchaseRequestItems } from "../../schemas/purchase-request-item.schema";
import { purchaseRequests } from "../../schemas/purchase-request.schema";
import {
  NewPurchaseRequest,
  NewPurchaseRequestItem,
  PurchaseRequestFormType,
} from "../../types/purchase-request.type";
import { PurchaseRequestFormSchema } from "../../validation/purchase-request-form";

import { PURCHASE_REQUEST_ITEM_STATUS } from "../../constants/purchase-request-item-status";
import { notifyPREmail } from "./notify-PR-creation.service";

export async function createPurchaseRequest(
  data: PurchaseRequestFormType,
  companyId: string,
  createdByUserId: string,
) {
  try {
    const validData = PurchaseRequestFormSchema.parse(data);

    const purchaseRequest = await db.transaction(async (tx) => {
      const purchaseRequestNumber = await generatePurchaseRequestNumber(
        tx,
        companyId,
      );

      const newPR: NewPurchaseRequest = {
        companyId,
        purchaseRequestNumber,
        totalItems: validData.items.length,
        totalRequestedQty: validData.items.reduce(
          (sum, item) => sum + item.requestedQty,
          0,
        ),
        createdByUserId,
        remarks: validData.remarks ?? null,
      };

      const [purchaseRequest] = await tx
        .insert(purchaseRequests)
        .values(newPR)
        .returning();

      const newPRItems: NewPurchaseRequestItem[] = validData.items.map(
        (item) => ({
          productId: item.productId,
          purchaseRequestId: purchaseRequest.id,
          requestedQty: item.requestedQty,
          supplierId: item.supplierId ?? null,
          status:
            item.supplierId === "" ||
            item.supplierId === null ||
            item.supplierId === "undefined"
              ? PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED
              : PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL,
        }),
      );

      await tx.insert(purchaseRequestItems).values(newPRItems);

      return purchaseRequest;
    });

    notifyPREmail({
      companyId,
      purchaseRequestNumber: purchaseRequest.purchaseRequestNumber,
      totalItems: purchaseRequest.totalItems,
      totalRequestedQty: purchaseRequest.totalRequestedQty,
      remarks: purchaseRequest.remarks,
    }).catch((error: any) => {
      console.error("Failed to send purchase request notification:", error);
    });

    return purchaseRequest;
  } catch (error) {
    throw mapDatabaseError(error);
  }
}
