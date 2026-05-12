"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import DashbaordComponent from "@/features/dashboard/components/dashboard.main"
import { InventoryProvider } from "@/features/inventory/context/inventory-provider"
import { PurchaseProvider } from "@/features/purchase/context/purchase-provider"
import { SalesProvider } from "@/features/sales/context/sales-provider"
import { SuppliersProvider } from "@/features/suppliers/context/supplier-provider"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <InventoryProvider>
        <SalesProvider>
          <PurchaseProvider>
            <SuppliersProvider>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  Analytics and Reports
                </h1>
                <p className="text-muted-foreground">
                  Get insights into your inventory, sales, and purchases with
                  our comprehensive analytics dashboard
                </p>
              </div>
              <DashbaordComponent />
            </SuppliersProvider>
          </PurchaseProvider>
        </SalesProvider>
      </InventoryProvider>
    </DashboardLayout>
  )
}
