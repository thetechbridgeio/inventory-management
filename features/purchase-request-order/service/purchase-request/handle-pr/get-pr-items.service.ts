import { purchaseRequests, purchaseRequestItems } from "@/db/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { and, eq } from "drizzle-orm";
import { PURCHASE_REQUEST_STATUS } from "../../../constants/purchase-request-status";
import { db } from "@/db";

export type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

type Props = {
  tx: Tx;
  companyId: string;
  purchaseRequestId: string;
};

export async function getPurchaseRequestItemsForApproval({
  tx,
  companyId,
  purchaseRequestId,
}: Props) {
  const purchaseRequest = await tx.query.purchaseRequests.findFirst({
    where: and(
      eq(purchaseRequests.id, purchaseRequestId),
      eq(purchaseRequests.companyId, companyId),
    ),
  });

  if (!purchaseRequest) {
    throw new NotFoundError("Purchase Request not found.");
  }

  if (
    purchaseRequest.status !== PURCHASE_REQUEST_STATUS.PENDING_APPROVAL &&
    purchaseRequest.status !== PURCHASE_REQUEST_STATUS.PARTIALLY_APPROVED
  ) {
    throw new ValidationError("Purchase Request can no longer be approved.");
  }
  const items = await tx.query.purchaseRequestItems.findMany({
    where: eq(purchaseRequestItems.purchaseRequestId, purchaseRequestId),
  });

  if (items.length === 0) {
    throw new ValidationError("Purchase Request has no items.");
  }

  return items;
}
