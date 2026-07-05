import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";

import { PurchaseOrderList } from "../../purchase-order/purchase-order-list";
import { useExportPurchaseOrder } from "@/features/purchase-request-order/hooks/use-export-PO";
import { useGetPurchaseOrdersByPurchaseRequest } from "@/features/purchase-request-order/hooks/use-get-PO-by-PR";
import { useSendPurchaseOrderEmail } from "@/features/purchase-request-order/hooks/use-send-PO-email";

export default function PurchaseOrderSection({
  purchaseRequestId,
}: {
  purchaseRequestId: string;
}) {
  const exportPurchaseOrder = useExportPurchaseOrder();
  const sendPurchaseOrderEmail =
    useSendPurchaseOrderEmail({ purchaseRequestId });

  const [exportingPurchaseOrderId, setExportingPurchaseOrderId] =
    useState<string>();
  const [sendingPurchaseOrderId, setSendingPurchaseOrderId] =
    useState<string>();

  const {
    data: purchaseOrders = [],
    isLoading,
    isError,
  } = useGetPurchaseOrdersByPurchaseRequest({
    purchaseRequestId,
    enabled: true,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive">
        <TriangleAlert className="h-5 w-5 shrink-0" />
        <span>Failed to load generated purchase orders.</span>
      </div>
    );
  }

  if (!purchaseOrders.length) return null;

  return (
    <PurchaseOrderList
      purchaseOrders={purchaseOrders}
      onExport={handleExport}
      onSendEmail={handleSendEmail}
      exportingPurchaseOrderId={exportingPurchaseOrderId}
      sendingPurchaseOrderId={sendingPurchaseOrderId}
    />
  );
}
