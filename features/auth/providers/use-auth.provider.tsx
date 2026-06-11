"use client";

import { createContext, ReactNode, useContext } from "react";

import { useMe } from "@/features/auth/hooks/use-me";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Loader2 } from "lucide-react";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
};

const AuthContext = createContext<CurrentUser | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Logo" className="h-14 animate-pulse" />
          <div className="mt-3 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading your data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-sm text-center">
          <h2 className="font-semibold">Unable to load user information</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Please refresh the page or sign in again.
          </p>
        </div>
      </div>
    );
  }
  return (
    <AuthContext.Provider value={user.data}>{children}</AuthContext.Provider>
  );
}

export function useCurrentUser() {
  const user = useContext(AuthContext);

  if (!user) {
    throw new Error("useCurrentUser must be used within AuthProvider");
  }

  return user;
}
