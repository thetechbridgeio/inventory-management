import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryProvider } from "@/features/inventory/context/inventory-provider"
import { AddPurchaseButton } from "@/features/purchase/components/add-purchase-dialog"
import { PurchasesTable } from "@/features/purchase/components/data-table/purchases-table"
import { RefreshPurchasesButton } from "@/features/purchase/components/purchase-refresh-button"
import { PurchaseProvider } from "@/features/purchase/context/purchase-provider"
import { SuppliersProvider } from "@/features/suppliers/context/supplier-provider"

const PurchasePage = () => {
  return (
    <DashboardLayout>
      <InventoryProvider>
        <SuppliersProvider>
          <PurchaseProvider>
            <div className="flex justify-between items-center gap-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Purchase Management
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Manage and track your purchases/incomings
                </p>
              </div>
              <div className="flex justify-end items-center gap-3">
                <RefreshPurchasesButton />
                <AddPurchaseButton />
              </div>
            </div>
            <PurchasesTable />
          </PurchaseProvider>
        </SuppliersProvider>
      </InventoryProvider>
    </DashboardLayout>
  )
}

export default PurchasePage
