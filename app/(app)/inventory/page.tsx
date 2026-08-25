"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/features/auth/constants/user-role";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { BulkUploadDialog } from "@/features/product/components/bulk-upload/bulk-upload-dialog";
import { ProductList } from "@/features/product/components/data-table/product-list";
import { DownloadProductTemplateButton } from "@/features/product/components/download-template-button";
import { MonthlyReportDropdown } from "@/features/product/components/monthly-report/monthly-report-dropdown";
import { PurchaseRequestBanner } from "@/features/purchase-request-order/components/purchase-request/purchase-request-banner";

const InventoryPage = () => {
  const { user } = useAuth();

  const canViewPurchaseRequestBanner =
    user?.role === ROLES.PURCHASE_ADMIN ||
    user?.role === ROLES.SUPER_ADMIN ||
    user?.role === ROLES.OPERATIONS_ADMIN;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage and track your product inventory
            </p>
          </div>

          <div className="flex items-center gap-4">
            <MonthlyReportDropdown />

            <DownloadProductTemplateButton />

            <BulkUploadDialog />

            <Button asChild>
              <Link href="/inventory/create">
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {canViewPurchaseRequestBanner && <PurchaseRequestBanner />}

        <ProductList />
      </div>
  );
};

export default InventoryPage;