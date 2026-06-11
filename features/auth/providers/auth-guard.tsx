"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { useAuth } from "./use-auth.provider";


type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({
  children,
}: AuthGuardProps) {
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}