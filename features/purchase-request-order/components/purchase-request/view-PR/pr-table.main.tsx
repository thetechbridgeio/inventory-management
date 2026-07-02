"use client";

import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  PurchaseRequestApprovalForm,
  ViewPurchaseRequestProduct,
} from "../../../types/purchase-request.type";
import { PurchaseRequestApprovalTable } from "../approval-table/approval-table";
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
        decision: product.supplierId ? "APPROVE" : "ACTION_REQUIRED",
        approvedQty: product.requestedQty,
        supplierId: product.supplierId,
        supplierName: product.supplierName,
      })),
    });
  }, [products, form]);

  const onSubmit = (values: PurchaseRequestApprovalForm) => {
    approvePurchaseRequest({
      purchaseRequestId: prData.purchaseRequestId,
      items: values.purchaseRequestItems,
    });
  };

  const handleReject = () => {
    rejectPurchaseRequest(prData.purchaseRequestId);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <PurchaseRequestApprovalTable
          data={products ?? []}
          isLoading={!products}
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