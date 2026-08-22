import { Button } from "@/components/ui/button";
import { SupplierList } from "@/features/suppliers/components/data-table/supplier-list";
import Link from "next/link";
import React from "react";

const SupplierPage = () => {
  return (
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Supplier Settings
            </h1>

            <p className="mt-1 text-muted-foreground">
              Manage supplier information, procurement preferences, and
              operational vendors.
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href={"/suppliers/create"}>
                Add Supplier
              </Link>
            </Button>
          </div>
        </div>
          <SupplierList/>
      </div>
  );
};

export default SupplierPage;
