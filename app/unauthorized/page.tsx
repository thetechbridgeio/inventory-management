"use client"
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-10 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>

        <p className="mt-3 text-muted-foreground">
          You don't have permission to access this page. If you believe this is
          a mistake, please contact your administrator.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              home
            </Link>
          </Button>

          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}
