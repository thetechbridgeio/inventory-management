// components/layout/dashboard-layout.tsx

import { ReactNode } from "react"

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { RequireAuth } from "@/features/auth/components/require-auth"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <RequireAuth>
      <div className="h-screen overflow-hidden bg-[#f6f7fb]">
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="ml-72.5 flex h-screen flex-col">
          {/* Fixed Header */}
          <Header />

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full p-6">{children}</div>
          </main>
        </div>
      </div>
    </RequireAuth>
  )
}
