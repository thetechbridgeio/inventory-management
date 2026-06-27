"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PurchaseRequestTable } from "@/features/purchase-request-order/components/purchase-request/data-table/purchase-request-table";
import { PURCHASE_REQUEST_DEMO_DATA } from "@/features/purchase-request-order/types/purchase-request.type";
import {
  PurchaseRequestForm,
  PurchaseRequestSchema,
} from "@/features/purchase-request-order/validation/purchase-request-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

const PurchaseRequestCreationPage = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const form = useForm<PurchaseRequestForm>({
    resolver: zodResolver(PurchaseRequestSchema),
    defaultValues: {
      remarks: "",
      items: PURCHASE_REQUEST_DEMO_DATA.map((p) => ({
        productId: p.productId,
        supplierId: p.supplierId ?? "",
        supplierName: p.supplierName ?? "",
        requestedQty: p.reorderQty,
      })),
    },
  });

  const onSubmit = (values: PurchaseRequestForm) => {
    console.log("clicked");
    const selectedItems = values.items.filter(
      (item) => rowSelection[item.productId],
    );

    console.log({
      remarks: values.remarks,
      items: selectedItems,
    });
  };
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Purchase Request
          </h1>

          <p className="mt-1 text-muted-foreground">
            elect products, review quantities, assign suppliers, and generate a
            purchase request.
          </p>
        </div>
      </div>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const firstError = Object.values(errors)[0];
            console.log(errors)

            toast.error(firstError?.message ?? "Validation failed.");
          })}
        >
          <PurchaseRequestTable
            data={PURCHASE_REQUEST_DEMO_DATA}
            isLoading={false}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        </form>
      </FormProvider>
    </DashboardLayout>
  );
};

export default PurchaseRequestCreationPage;
