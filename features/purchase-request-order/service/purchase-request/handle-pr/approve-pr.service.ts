import { db } from "@/db";
import { getPurchaseRequestItemsForApproval } from "./get-pr-items.service";
import {
  PurchaseRequestApprovalForm,
  PurchaseRequestApprovalItems,
} from "../../../types/purchase-request.type";
import { generateModifiedPRItems } from "./generate-modified-PR-items.service";
import { updatePurchaseRequestItems } from "./update-pr-item.service";
import { updatePurchaseRequestStatus } from "./update-pr-status.service";
import { generatePurchaseOrders } from "./generate-po.service";

export async function approvePurchaseRequest(
  companyId: string,
  processedByUserId: string,
  purchaseRequestId: string,
  approvedItems: PurchaseRequestApprovalItems[],
) {
  return db.transaction(async (tx) => {
    const purchaseRequestItems = await getPurchaseRequestItemsForApproval({
      tx,
      companyId,
      purchaseRequestId,
    });
    const { itemUpdates, approvedPRItems } =
      generateModifiedPRItems(approvedItems, purchaseRequestItems);

    await updatePurchaseRequestItems(tx, itemUpdates);

    await updatePurchaseRequestStatus(tx, purchaseRequestId, processedByUserId);

    await generatePurchaseOrders(
      tx,
      companyId,
      purchaseRequestId,
      processedByUserId,
      approvedPRItems,
    );
  });
}
