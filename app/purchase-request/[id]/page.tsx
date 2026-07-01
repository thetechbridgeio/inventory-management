"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetPurchaseRequestById } from "@/features/purchase-request-order/hooks/use-get-PR-by-id";
import ViewPRMain from "@/features/purchase-request-order/components/purchase-request/view-PR/view-PR.main";

const PurchaseRequestView = () => {
  const params = useParams();

  const purchaseRequestId = params.id as string;

  const {
    data: purchaseRequest,
    isLoading,
    isError,
    error,
  } = useGetPurchaseRequestById({
    purchaseRequestId,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Loading purchase request...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="border-destructive/20 bg-destructive/5 max-w-md rounded-lg border p-6 text-center">
            <TriangleAlert className="text-destructive mx-auto mb-4 h-10 w-10" />

            <h2 className="mb-2 text-lg font-semibold">
              Failed to load purchase request
            </h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!purchaseRequest) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <TriangleAlert className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
            <h2 className="text-lg font-semibold">
              Purchase request not found
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              The requested purchase request does not exist or may have been
              removed.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ViewPRMain purchaseRequestTotal={purchaseRequest} />
    </DashboardLayout>
  );
};

export default PurchaseRequestView;
