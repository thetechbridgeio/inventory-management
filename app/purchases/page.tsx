import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { PurchaseList } from "@/features/purchase/components/data-table/purchase-list";
import Link from "next/link";
import React from "react";

const PurchasePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Incoming
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage incoming information
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href={"/purchases/create"}>Add Purchase</Link>
            </Button>
          </div>
        </div>
        <PurchaseList/>
      </div>
    </DashboardLayout>
  );
};

export default PurchasePage;
