import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryProvider } from "@/features/inventory/context/inventory-provider"
import { AddSalesButton } from "@/features/sales/components/add-sale-dialog"
import { SalesTable } from "@/features/sales/components/data-table/sale-data-table"
import { RefreshSalesButton } from "@/features/sales/components/refresh-sale-button"
import { SalesProvider } from "@/features/sales/context/sales-provider"

const SalesPage = () => {
  return (
    <DashboardLayout>
      <InventoryProvider>
        <SalesProvider>
          <div className="flex justify-between items-center gap-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Outgoing Management
              </h1>
              <p className="mt-2 text-muted-foreground">
                Manage and track your sales/outgoings
              </p>
            </div>
            <div className="flex justify-end items-center gap-3">
              <RefreshSalesButton />
              <AddSalesButton />
            </div>
          </div>
          <SalesTable />
        </SalesProvider>
      </InventoryProvider>
    </DashboardLayout>
  )
}

export default SalesPage
