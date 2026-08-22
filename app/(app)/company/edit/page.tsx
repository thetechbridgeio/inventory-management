"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useCompany } from "@/features/company/hooks/use-company";
import { EditCompanyFormFields } from "@/features/company/components/edit-company-form-fields";
import { CompanyFormValues } from "@/features/company/types/company.type";
import { companyFormSchema } from "@/features/company/validations/company.validation";
import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { ROLES } from "@/features/auth/constants/user-role";

function toDefaultValues(company: NonNullable<ReturnType<typeof useCompany>["data"]>): CompanyFormValues {
  return {
    name: company.name ?? "",
    gst: company.gst ?? "",
    address: company.address ?? "",
    description: company.description ?? "",
    logoUrl: company.logoUrl ?? undefined,
    website: company.website ?? "",
    contactPersonName: company.contactPersonName ?? "",
    contactPersonEmail: company.contactPersonEmail ?? "",
    contactPersonPhone: company.contactPersonPhone ?? "",
  };
}

const EditCompanyPage = () => {
  const router = useRouter();
  const { hasRole } = useAuth();
  const { data: company, isLoading } = useCompany();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
  });

  useEffect(() => {
    if (!hasRole(ROLES.SUPER_ADMIN)) {
      router.replace("/company");
    }
  }, [hasRole, router]);

  useEffect(() => {
    if (company) {
      form.reset(toDefaultValues(company));
    }
  }, [company, form]);

  if (!hasRole(ROLES.SUPER_ADMIN)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-muted-foreground">
        Company not found.
      </div>
    );
  }

  return (
    <FormProvider {...form}>
        <EditCompanyFormFields />
      </FormProvider>
  );
};

export default EditCompanyPage;
