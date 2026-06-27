"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import PurchaseRequestCard from "@/features/purchase-request-order/components/purchase-request-card";
import { PURCHASE_REQUEST_DEMO_DATA_LIST } from "@/features/purchase-request-order/types/purchase-request.type";

const PurchaseRequestPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Purchase Requests
          </h1>
          <p className="text-muted-foreground">
            All purchase requests created within your organization are listed
            here. Review their status, track approvals, and manage procurement
            requests.
          </p>
        </div>

        <div className="grid gap-4">
          {PURCHASE_REQUEST_DEMO_DATA_LIST.map((purchaseRequest) => (
            <PurchaseRequestCard
              key={purchaseRequest.id}
              request={purchaseRequest}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseRequestPage;