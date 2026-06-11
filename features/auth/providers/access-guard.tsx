"use client";

import { ReactNode } from "react";
import { useAuth } from "./use-auth.provider";


type AccessGuardProps = {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function AccessGuard({
  roles,
  children,
  fallback,
}: AccessGuardProps) {
  const { user, isLoading } =
    useAuth();

  if (isLoading) {
    return null;
  }
    
  if (!user) {
    return null;    
  }

  const hasAccess =
    roles.length === 0 ||
    roles.includes(user.role);

  if (!hasAccess) {
    return (
      fallback ?? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <h2 className="font-semibold">
              Access Denied
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You do not have permission to
              access this page.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}