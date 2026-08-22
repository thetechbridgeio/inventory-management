"use client";
import Link from "next/link";
import { Building2, Pencil } from "lucide-react";
import { useCompany } from "@/features/company/hooks/use-company";
import { CompanyProfile } from "@/features/company/components/company-profile";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { ROLES } from "@/features/auth/constants/user-role";

const CompanyPage = () => {
  const { data: company, isLoading } = useCompany();
  const { hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <Building2 className="h-10 w-10 animate-pulse text-primary" />
          </div>

          <div className="space-y-1 text-center">
            <h3 className="font-semibold">Loading company profile</h3>

            <p className="text-sm text-muted-foreground">
              Please wait while we fetch your company details
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

          <h3 className="font-semibold">Company not found</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Unable to load company information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>

          <p className="mt-1 text-muted-foreground">
            Manage your company information and business details.
          </p>
        </div>

        {hasRole(ROLES.SUPER_ADMIN) && (
          <Button size="sm" variant="outline" asChild>
            <Link href="/company/edit">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Company
            </Link>
          </Button>
        )}
      </div>

      <CompanyProfile company={company} />
    </div>
  );
};

export default CompanyPage;
