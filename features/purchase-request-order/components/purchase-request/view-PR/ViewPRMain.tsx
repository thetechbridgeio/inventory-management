// Refactored ViewPRMain
"use client";

import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { can } from "@/features/auth/constants/permissions";
import { PurchaseRequestHeader } from "./PR-header";
import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";
import PurchaseRequestApprovalSection from "./purchase-request-approval-section";
import PurchaseOrderSection from "./purchase-order-section";

export type PRPropDataType = {
  purchaseRequestId: string;
  purchaseRequestNumber: string;
};

export default function ViewPRMain({
  purchaseRequestTotal,
}: {
  purchaseRequestTotal: ViewPurchaseRequestType;
}) {
  const { user } = useAuth();

  const canManagePurchaseRequest =
    !!user && can(user.role, "purchase-request:approve");

  const { products, ...purchaseRequest } = purchaseRequestTotal;

  return (
    <div className="space-y-4">
      <PurchaseRequestHeader pr={purchaseRequest} />

      {canManagePurchaseRequest && (
        <>
          <PurchaseRequestApprovalSection
            products={products}
            prData={{
              purchaseRequestId: purchaseRequest.id,
              purchaseRequestNumber: purchaseRequest.purchaseRequestNumber,
            }}
          />
        </>
      )}
      <PurchaseOrderSection purchaseRequestId={purchaseRequest.id} />
    </div>
  );
}
