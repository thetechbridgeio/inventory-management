import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AddInventoryButton } from "@/features/inventory/components/add-inventory-button"
import { InventoryTable } from "@/features/inventory/components/data-table/inventory-table"
import LowStockBanner from "@/features/inventory/components/low-stock-banner"
import { RefreshInventoryButton } from "@/features/inventory/components/refresh-inventory-button"
import { InventoryProvider } from "@/features/inventory/context/inventory-provider"

const InventoryPage = () => {
  return (
    <DashboardLayout>
      <InventoryProvider>
        <div className="flex justify-between items-center gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage and track your product inventory
            </p>
          </div>
          <div className="flex justify-end items-center gap-3">
            <RefreshInventoryButton />
            <AddInventoryButton />
          </div>
        </div>
        <div className="mb-6">
          <LowStockBanner />
        </div>
        <InventoryTable />
      </InventoryProvider>
    </DashboardLayout>
  )
}

export default InventoryPage
