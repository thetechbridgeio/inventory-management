"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { ProductList } from "@/features/product/components/data-table/product-list";
import { PurchaseRequestBanner } from "@/features/purchase-request-order/components/purchase-request/purchase-request-banner";
import Link from "next/link";

const InventoryPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage and track your product inventory
            </p>
          </div>
          <div className="flex justify-end items-center gap-3">
            <Button asChild>
              <Link href={"/inventory/create"}>Add Product</Link>
            </Button>
          </div>
        </div>
        {user?.role === "PURCHASE_ADMIN" ||
          (user?.role === "SUPER_ADMIN" && <PurchaseRequestBanner />)}
        <ProductList />
      </div>
    </DashboardLayout>
  );
};

export default InventoryPage;
