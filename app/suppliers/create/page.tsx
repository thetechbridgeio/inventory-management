"use client";
import { CREATE_SUPPLIER_FORM_DEFAULT } from "@/features/suppliers/default/form.default";
import { CreateSupplierForm } from "@/features/suppliers/components/add-supplier/add-supplier-form";
import { CreateSupplierFormType } from "@/features/suppliers/types/suppliers.type";
import { supplierSchema } from "@/features/suppliers/validations/suppliers.validation";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useCreateSupplier } from "@/features/suppliers/hooks/use-create-supplier";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const CreateSupplierPage = () => {
  const createSupplierForm = useForm<CreateSupplierFormType>({
    resolver: zodResolver(supplierSchema),
    defaultValues: CREATE_SUPPLIER_FORM_DEFAULT,
    mode: "onTouched",
  });

  const { mutate, isPending } = useCreateSupplier();

  const onSubmit = (data: CreateSupplierFormType) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Supplier created successfully");
        createSupplierForm.reset();
      },
      onError: () => {
        toast.error("Failed to create supplier");
      },
    });
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
          <FormProvider {...createSupplierForm}>
            <form
              onSubmit={createSupplierForm.handleSubmit(onSubmit)}
              className="space-y-8"
            >
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

                <Button type="submit" disabled={isPending} size="lg">
                  {isPending ? "Creating Supplier..." : "Create Supplier"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateSupplierPage;
