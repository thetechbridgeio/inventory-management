"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

import { CREATE_SUPPLIER_FORM_DEFAULT } from "@/features/suppliers/default/form.default";
import { CreateSupplierForm } from "@/features/suppliers/components/add-supplier/add-supplier-form";
import { useCreateSupplier } from "@/features/suppliers/hooks/use-create-supplier";
import { CreateSupplierFormType } from "@/features/suppliers/types/suppliers.type";
import { CreateSupplierFormSchema } from "@/features/suppliers/validations/suppliers.validation";

export default function CreateSupplierPage() {
  const form = useForm<CreateSupplierFormType>({
    resolver: zodResolver(CreateSupplierFormSchema),
    defaultValues: CREATE_SUPPLIER_FORM_DEFAULT,
    mode: "onTouched",
  });

  const { mutateAsync, isPending } = useCreateSupplier();

  const onSubmit = async (data: CreateSupplierFormType) => {
    await mutateAsync(data);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add New Supplier
            </h1>

            <p className="mt-2 text-muted-foreground">
              Register a supplier for inventory procurement and operational
              management.
            </p>
          </div>

          <Button asChild>
            <Link href="/suppliers">
              <ArrowLeft />
              Back
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <CreateSupplierForm />

              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <p className="text-sm font-medium">
                    Ready to create this supplier?
                  </p>

                  <p className="text-sm text-muted-foreground">
                    You can update supplier details later.
                  </p>
                </div>

                <Button type="submit" size="lg" disabled={isPending}>
                  {isPending ? "Creating Supplier..." : "Create Supplier"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </DashboardLayout>
  );
}
