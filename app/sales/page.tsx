import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { SaleList } from "@/features/sales/components/data-table/sale-list";
import Link from "next/link";
import React from "react";

const SalePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Outgoing Settings
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage outgoing information
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href={"/sales/create"}>Add Outgoing</Link>
            </Button>
          </div>
        </div>
        <SaleList />
      </div>
    </DashboardLayout>
  );
};

export default SalePage;
