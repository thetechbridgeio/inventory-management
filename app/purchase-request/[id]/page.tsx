"use client";

import { useParams } from "next/navigation";
import { Loader2, TriangleAlert } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPurchaseRequestById } from "@/features/purchase-request-order/hooks/use-get-PR-by-id";
import ViewPRMain from "@/features/purchase-request-order/components/purchase-request/view-PR/ViewPRMain";

type PageStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
};

function PageState({ icon, title, description }: PageStateProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center py-10 text-center">
          {icon}

          <h2 className="mt-4 text-lg font-semibold">{title}</h2>

          {description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const PurchaseRequestView = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: purchaseRequest,
    isLoading,
    isError,
  } = useGetPurchaseRequestById({
    purchaseRequestId: id,
  });

  return (
    <DashboardLayout>
      {isLoading ? (
        <PageState
          icon={
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          }
          title="Loading purchase request..."
          description="Please wait while we fetch the purchase request."
        />
      ) : isError ? (
        <PageState
          icon={
            <TriangleAlert className="h-10 w-10 text-destructive" />
          }
          title="Failed to load purchase request"
          description="Something went wrong while retrieving the purchase request. Please try again."
        />
      ) : !purchaseRequest ? (
        <PageState
          icon={
            <TriangleAlert className="h-10 w-10 text-muted-foreground" />
          }
          title="Purchase request not found"
          description="The requested purchase request does not exist or may have been removed."
        />
      ) : (
        <ViewPRMain purchaseRequestTotal={purchaseRequest} />
      )}
    </DashboardLayout>
  );
};

export default PurchaseRequestView;