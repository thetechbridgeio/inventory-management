"use client";

import ProcessOrderDetailMain from "@/features/process-order/components/details/process-order-detail.main";
import { useProcessOrder } from "@/features/process-order/hooks/use-process-order";

interface ProcessOrderDetailClientProps {
  id: string;
}

export default function ProcessOrderDetailClient({
  id,
}: ProcessOrderDetailClientProps) {
  const {
    data: processOrderDetail,
    isPending,
    isError,
    error,
  } = useProcessOrder(id);

  console.log(processOrderDetail)

  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading process order...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <h2 className="text-lg font-semibold">
          Failed to load process order
        </h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "Something went wrong."}
        </p>
      </div>
    );
  }

  if (!processOrderDetail) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">
          Process order not found.
        </p>
      </div>
    );
  }

  return <ProcessOrderDetailMain processOrder={processOrderDetail} />;
}