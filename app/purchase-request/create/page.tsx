"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RowSelectionState } from "@tanstack/react-table";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PurchaseRequestTable } from "@/features/purchase-request-order/components/purchase-request/data-table/purchase-request-table";
import { useGetPRProduct } from "@/features/purchase-request-order/hooks/use-get-low-stock-products";
import { PurchaseRequestFormSchema } from "@/features/purchase-request-order/validation/purchase-request-form";
import { PurchaseRequestFormType } from "@/features/purchase-request-order/types/purchase-request.type";
import { useCreatePurchaseRequest } from "@/features/purchase-request-order/hooks/use-create-PR";

const PurchaseRequestCreationPage = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: lowStockProducts = [], isLoading } = useGetPRProduct();
  const { mutate: createPurchaseRequest, isPending: isPRCreatePending } =
    useCreatePurchaseRequest();

  const form = useForm<PurchaseRequestFormType>({
    resolver: zodResolver(PurchaseRequestFormSchema),
    defaultValues: {
      remarks: "",
      items: [],
    },
  });

  useEffect(() => {
    if (!lowStockProducts.length) return;

    form.reset({
      remarks: "",
      items: lowStockProducts.map((product) => ({
        productId: product.productId,
        supplierId: product.supplierId ?? null,
        supplierName: product.supplierName ?? null,
        requestedQty: product.reorderQty,
      })),
    });
  }, [lowStockProducts, form]);

  const onSubmit = (values: PurchaseRequestFormType) => {
    const selectedItems = values.items.filter(
      (item) => rowSelection[item.productId],
    );
    createPurchaseRequest({
      remarks: values.remarks,
      items: selectedItems,
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Purchase Request
          </h1>

          <p className="mt-1 text-muted-foreground">
            Select products, review quantities, assign suppliers, and generate a
            purchase request.
          </p>
        </div>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log(errors);

            const firstError = Object.values(errors)[0];
            toast.error(firstError?.message ?? "Validation failed.");
          })}
        >
          <PurchaseRequestTable
            data={lowStockProducts}
            isLoading={isLoading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            isPRCreatePending={isPRCreatePending}
          />
        </form>
      </FormProvider>
    </DashboardLayout>
  );
};

export default PurchaseRequestCreationPage;
