// components/layout/dashboard-layout.tsx

import { ReactNode } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { AuthProvider } from "@/features/auth/providers/use-auth.provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <div className="h-screen overflow-hidden bg-[#f6f7fb]">
        <Sidebar />

        <div className="ml-72.5 flex h-full flex-col">
          <Header />

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
