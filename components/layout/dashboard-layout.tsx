// components/layout/dashboard-layout.tsx

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

import { AuthProvider, useAuth } from "@/features/auth/providers/use-auth.provider";

interface DashboardLayoutProps {
  children: ReactNode;
}

function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-14 animate-pulse"
          />

          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              Loading your data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f6f7fb]">
      <Sidebar />

      <div className="ml-72.5 flex h-full flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedLayout>
        {children}
      </ProtectedLayout>
    </AuthProvider>
  );
}