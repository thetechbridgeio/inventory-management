"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RequireAdmin } from "@/features/auth/components/require-admin"
import { AddClientButton } from "@/features/clients/components/add-client-form"
import { ClientTable } from "@/features/clients/components/client-table"
import { RefreshClientsButton } from "@/features/clients/components/refresh-client-button"

const ClientPage = () => {
  return (
    <RequireAdmin>
      <DashboardLayout>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Client Management
            </h1>
            <p className="text-muted-foreground">
              Manage clients, credentials, and data access
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <RefreshClientsButton />

            <AddClientButton />
          </div>
        </div>
        <ClientTable />
      </DashboardLayout>
    </RequireAdmin>
  )
}

export default ClientPage
