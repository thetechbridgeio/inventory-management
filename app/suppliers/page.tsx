// app/dashboard/suppliers/page.tsx
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AddSupplierButton } from "@/features/suppliers/components/add-supplier-button"

import { RefreshSuppliersButton } from "@/features/suppliers/components/refresh-button"

import { SupplierTable } from "@/features/suppliers/components/supplier-table"

import { SuppliersProvider } from "@/features/suppliers/context/supplier-provider"

const SupplierPage = () => {
  return (
    <DashboardLayout>
      <SuppliersProvider>
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
              <RefreshSuppliersButton />

              <AddSupplierButton />
            </div>
          </div>

          {/* TABLE */}
          <SupplierTable />
        </div>
      </SuppliersProvider>
    </DashboardLayout>
  )
}

export default SupplierPage
