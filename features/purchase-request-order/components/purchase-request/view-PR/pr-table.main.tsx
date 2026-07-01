"use client";

import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { RowSelectionState } from "@tanstack/react-table";

import {
  PurchaseRequestApprovalForm,
  PurchaseRequestApprovalItems,
  ViewPurchaseRequestProduct,
} from "../../../types/purchase-request.type";
import { PurchaseRequestApprovalTable } from "../approval-table/approval-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { PurchaseRequestApprovalFormSchema } from "../../../validation/approve-pr-form";
import { PRPropDataType } from "./view-PR.main";
import { useRejectPurchaseRequest } from "@/features/purchase-request-order/hooks/use-reject-PR";
import { useApprovePurchaseRequest } from "@/features/purchase-request-order/hooks/use-approve-pr";

const PRTableMain = ({
  products,
  prData,
}: {
  products?: ViewPurchaseRequestProduct[];
  prData: PRPropDataType;
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { mutate: rejectPurchaseRequest, isPending: isRejectPending } =
    useRejectPurchaseRequest();

  const { mutate: approvePurchaseRequest, isPending: isApprovePending } =
    useApprovePurchaseRequest();
  const form = useForm<PurchaseRequestApprovalForm>({
    resolver: zodResolver(PurchaseRequestApprovalFormSchema),
    defaultValues: {
      purchaseRequestItems: [],
    },
  });

  useEffect(() => {
    if (!products) return;

    form.reset({
      purchaseRequestItems: products.map((product) => ({
        purchaseRequestItemId: product.purchaseRequestItemId,
        approvedQty: product.requestedQty,
        supplierId: product.supplierId,
        supplierName: product.supplierName,
      })),
    });

    // Select all rows by default
    setRowSelection(
      Object.fromEntries(
        products
          .filter((product) => Boolean(product.supplierId?.trim()))
          .map((product) => [product.purchaseRequestItemId, true]),
      ),
    );
  }, [products, form]);

  const onSubmit = (values: PurchaseRequestApprovalForm) => {
    const selectedItems = values.purchaseRequestItems.filter(
      (item) => rowSelection[item.purchaseRequestItemId],
    );

    approvePurchaseRequest({
      purchaseRequestId: prData.purchaseRequestId,
      items: selectedItems,
    });
  };
  const handleReject = async () => {
    rejectPurchaseRequest(prData.purchaseRequestId);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PurchaseRequestApprovalTable
          data={products ?? []}
          isLoading={!products}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          isApprovePending={isApprovePending}
          isRejectPending={isRejectPending}
          onReject={handleReject}
          prData={prData}
        />
      </form>
    </FormProvider>
  );
};

export default PRTableMain;
