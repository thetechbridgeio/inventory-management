"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Building2 } from "lucide-react";
import { useCompany } from "@/features/company/hooks/use-company";
import { CompanyProfile } from "@/features/company/components/company-profile";


const CompanyPage = () => {
  const { data: company, isLoading } = useCompany();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-card shadow-sm">
              <Building2 className="h-10 w-10 animate-pulse text-primary" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="font-semibold">
                Loading company profile
              </h3>

              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your company details
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />

            <h3 className="font-semibold">
              Company not found
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Unable to load company information.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Company Profile
          </h1>

          <p className="mt-1 text-muted-foreground">
            Manage your company information and business details.
          </p>
        </div>

        <CompanyProfile company={company} />
      </div>
    </DashboardLayout>
  );
};

export default CompanyPage;