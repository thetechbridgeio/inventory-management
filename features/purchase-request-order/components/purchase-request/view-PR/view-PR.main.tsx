"use client";

import { Loader2, TriangleAlert } from "lucide-react";

import { ViewPurchaseRequestType } from "../../../types/purchase-request.type";
import { PurchaseRequestHeader } from "./PR-header";
import PRTableMain from "./pr-table.main";
import { PurchaseOrderList } from "../../purchase-order/purchase-order-list";
import { useGetPurchaseOrdersByPurchaseRequest } from "@/features/purchase-request-order/hooks/use-get-PO-by-PR";
import { useState } from "react";
import { useExportPurchaseOrder } from "@/features/purchase-request-order/hooks/use-export-PO";
import { useSendPurchaseOrderEmail } from "@/features/purchase-request-order/hooks/use-send-PO-email";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { ROLES } from "@/features/auth/constants/user-role";

export type PRPropDataType = {
  purchaseRequestId: string;
  purchaseRequestNumber: string;
};

const ViewPRMain = ({
  purchaseRequestTotal,
}: {
  purchaseRequestTotal: ViewPurchaseRequestType;
}) => {
  const { products, ...purchaseRequest } = purchaseRequestTotal;
  const exportPurchaseOrder = useExportPurchaseOrder();
  const sendPurchaseOrderEmail = useSendPurchaseOrderEmail({
    purchaseRequestId: purchaseRequest.id,
  });
  const { user } = useAuth();

  const [exportingPurchaseOrderId, setExportingPurchaseOrderId] =
    useState<string>();
  const [sendingPurchaseOrderId, setSendingPurchaseOrderId] =
    useState<string>();

  const prData = {
    purchaseRequestId: purchaseRequest.id,
    purchaseRequestNumber: purchaseRequest.purchaseRequestNumber,
  };

  const {
    data: purchaseOrders,
    isLoading: isPurchaseOrdersLoading,
    isError: isPurchaseOrdersError,
  } = useGetPurchaseOrdersByPurchaseRequest({
    purchaseRequestId: purchaseRequest.id,
  });

  const handleExport = (purchaseOrderId: string) => {
    setExportingPurchaseOrderId(purchaseOrderId);

    exportPurchaseOrder.mutate(purchaseOrderId, {
      onSettled: () => setExportingPurchaseOrderId(undefined),
    });
  };

  const handleSendEmail = (purchaseOrderId: string) => {
    setSendingPurchaseOrderId(purchaseOrderId);

    sendPurchaseOrderEmail.mutate(purchaseOrderId, {
      onSettled: () => setSendingPurchaseOrderId(undefined),
    });
  };

  return (
    <div className="space-y-4">
      <PurchaseRequestHeader pr={purchaseRequest} />

      {user?.role === ROLES.SUPER_ADMIN && (
        <PRTableMain products={products} prData={prData} />
      )}

      {isPurchaseOrdersLoading && (
        <div className="flex items-center justify-center rounded-lg border py-10">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        </div>
      )}

      {isPurchaseOrdersError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
          <TriangleAlert className="h-5 w-5 shrink-0" />
          <span>Failed to load generated purchase orders.</span>
        </div>
      )}

      {!!purchaseOrders?.length && (
        <PurchaseOrderList
          purchaseOrders={purchaseOrders}
          onExport={handleExport}
          onSendEmail={handleSendEmail}
          exportingPurchaseOrderId={exportingPurchaseOrderId}
          sendingPurchaseOrderId={sendingPurchaseOrderId}
        />
      )}
    </div>
  );
};

export default ViewPRMain;
