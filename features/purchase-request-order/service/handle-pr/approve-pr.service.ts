import { db } from "@/db";
import { getPurchaseRequestItemsForApproval } from "./get-pr-items.service";
import {
  PurchaseRequestApprovalForm,
  PurchaseRequestApprovalItems,
} from "../../types/purchase-request.type";
import { generateModifiedPRItems } from "./generate-modified-PR-items.service";
import { updatePurchaseRequestItems } from "./update-pr-item.service";
import { updatePurchaseRequestStatus } from "./update-pr-status.service";
import { generatePurchaseOrders } from "./generate-po.service";

export async function approvePurchaseRequest(
  companyId: string,
  createdByUserId: string,
  purchaseRequestId: string,
  approvedItems: PurchaseRequestApprovalItems[],
) {
  return db.transaction(async (tx) => {
    const purchaseRequestItems = await getPurchaseRequestItemsForApproval({
      tx,
      companyId,
      purchaseRequestId,
    });

    const { itemUpdates, approvedPRItems, purchaseRequestStatus } =
      generateModifiedPRItems(approvedItems, purchaseRequestItems);

    await updatePurchaseRequestItems(tx, itemUpdates);

    await updatePurchaseRequestStatus(
      tx,
      purchaseRequestId,
      purchaseRequestStatus,
    );

    await generatePurchaseOrders(
      tx,
      companyId,
      purchaseRequestId,
      createdByUserId,
      approvedPRItems,
    );
  });
}
