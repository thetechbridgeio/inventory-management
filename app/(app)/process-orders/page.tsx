import { Button } from "@/components/ui/button";
import ProcessOrderList from "@/features/process-order/components/process-order-list";
import Link from "next/link";
import React from "react";

const ProcessOrdersPage = () => {
  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Process Orders
            </h1>

            <p className="mt-1 max-w-2xl text-muted-foreground">
             Send materials for processing, receive finished products, and keep inventory in sync.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/process-orders/create">Create Process Order</Link>
            </Button>
          </div>
        </div>

        <ProcessOrderList />
      </div>
  );
};

export default ProcessOrdersPage;
