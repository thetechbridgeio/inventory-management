
import { PURCHASE_REQUEST_ITEM_STATUS, PurchaseRequestItemStatus } from "../../constants/purchase-request-item-status";
import { PURCHASE_REQUEST_STATUS } from "../../constants/purchase-request-status";
import {
  NewPurchaseRequestItem,
  PurchaseRequestApprovalItems,
} from "../../types/purchase-request.type";

export function generateModifiedPRItems(
  approvedItems: PurchaseRequestApprovalItems[],
  items: NewPurchaseRequestItem[],
) {
  const approvedMap = new Map(
    approvedItems.map((item) => [
      item.purchaseRequestItemId,
      item,
    ]),
  );

  const itemUpdates: {
    id: string;
    status: PurchaseRequestItemStatus;
    approvedQty: number;
    supplierId: string | null;
  }[] = [];

  const approvedPRItems: {
    purchaseRequestItemId: string;
    productId: string;
    approvedQty: number;
    supplierId: string;
  }[] = [];

  let approvedCount = 0;
  let eligibleCount = 0;

  for (const item of items) {
    // Ignore ACTION_REQUIRED
    if (item.status === PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED) {
      continue;
    }

    eligibleCount++;

    // Ignore already processed items
    if (
      item.status === PURCHASE_REQUEST_ITEM_STATUS.APPROVED ||
      item.status === PURCHASE_REQUEST_ITEM_STATUS.REJECTED
    ) {
      if (item.status === PURCHASE_REQUEST_ITEM_STATUS.APPROVED) {
        approvedCount++;
      }

      continue;
    }

    const approved = approvedMap.get(item.id!);

    if (approved) {
      approvedCount++;

      itemUpdates.push({
        id: item.id!,
        status: PURCHASE_REQUEST_ITEM_STATUS.APPROVED,
        approvedQty: approved.approvedQty,
        supplierId: approved.supplierId,
      });

      approvedPRItems.push({
        purchaseRequestItemId: item.id!,
        productId: item.productId,
        approvedQty: approved.approvedQty,
        supplierId: approved.supplierId!,
      });
    } else {
      itemUpdates.push({
        id: item.id!,
        status: PURCHASE_REQUEST_ITEM_STATUS.REJECTED,
        approvedQty: 0,
        supplierId: item.supplierId ?? null,
      });
    }
  }

  const purchaseRequestStatus =
    approvedCount === 0
      ? PURCHASE_REQUEST_STATUS.REJECTED
      : approvedCount === eligibleCount
        ? PURCHASE_REQUEST_STATUS.APPROVED
        : PURCHASE_REQUEST_STATUS.PARTIALLY_APPROVED;

  return {
    itemUpdates,
    approvedPRItems,
    purchaseRequestStatus,
  };
}
