import {
  PURCHASE_REQUEST_ITEM_STATUS,
  PurchaseRequestItemStatus,
} from "../../../constants/purchase-request-item-status";
import { PURCHASE_REQUEST_STATUS } from "../../../constants/purchase-request-status";
import {
  NewPurchaseRequestItem,
  PurchaseRequestApprovalItems,
} from "../../../types/purchase-request.type";

export function generateModifiedPRItems(
  approvalItems: PurchaseRequestApprovalItems[],
  items: NewPurchaseRequestItem[],
) {
  const itemMap = new Map(items.map((item) => [item.id!, item]));

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

  const finalStatuses: PurchaseRequestItemStatus[] = [];

  for (const approval of approvalItems) {
    const item = itemMap.get(approval.purchaseRequestItemId);

    if (!item) continue;

    switch (approval.decision) {
      case "APPROVE": {
        finalStatuses.push(PURCHASE_REQUEST_ITEM_STATUS.APPROVED);

        itemUpdates.push({
          id: item.id!,
          status: PURCHASE_REQUEST_ITEM_STATUS.APPROVED,
          approvedQty: approval.approvedQty,
          supplierId: approval.supplierId,
        });

        approvedPRItems.push({
          purchaseRequestItemId: item.id!,
          productId: item.productId,
          approvedQty: approval.approvedQty,
          supplierId: approval.supplierId,
        });

        break;
      }

      case "REJECT": {
        finalStatuses.push(PURCHASE_REQUEST_ITEM_STATUS.REJECTED);

        itemUpdates.push({
          id: item.id!,
          status: PURCHASE_REQUEST_ITEM_STATUS.REJECTED,
          approvedQty: 0,
          supplierId: approval.supplierId ?? null,
        });

        break;
      }

      case "ACTION_REQUIRED": {
        finalStatuses.push(PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED);

        itemUpdates.push({
          id: item.id!,
          status: PURCHASE_REQUEST_ITEM_STATUS.ACTION_REQUIRED,
          approvedQty: 0,
          supplierId: approval.supplierId ?? null,
        });

        break;
      }
    }
  }
  return {
    itemUpdates,
    approvedPRItems,
  };
}
