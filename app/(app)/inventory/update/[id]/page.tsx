"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { UPDATE_PRODUCT_DEFAULT_VALUES } from "@/features/product/constants/form-default";
import { useProduct } from "@/features/product/hooks/use-product";
import { UpdateProductFormType } from "@/features/product/types/product.types";
import { UpdateProductFormSchema } from "@/features/product/validations/product.validation";

import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";
import { UpdateProductFormFields } from "@/features/product/components/update-product/update-form-fields";

const UpdateProductPage = () => {
  const params = useParams();
  const productId = params.id as string;

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useProduct(productId);

  const { data: suppliersData, isPending: isSuppliersLoading } = useSuppliers();

  const suppliers = suppliersData?.data ?? [];

  const form = useForm<UpdateProductFormType>({
    resolver: zodResolver(UpdateProductFormSchema),
    defaultValues: UPDATE_PRODUCT_DEFAULT_VALUES,
    mode: "onTouched",
  });

  useEffect(() => {
    if (!product) return;

    form.reset({
      name: product.name,
      description: product.description ?? undefined,
      category: product.category,
      unit: product.unit,
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty,
      reorderQty: product.reorderQty,
      currentStock: product.currentStock,
      unitCost:
        product.unitCost !== null ? Number(product.unitCost) : undefined,
      location: product.location ?? undefined,
      image: product.image,
      supplierIds: product.suppliers?.map((supplier) => supplier.id) ?? [],
    });
  }, [product, form]);

  const isPageLoading = isProductLoading || isSuppliersLoading;

  if (isPageLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isProductError || !product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        Product not found!
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <UpdateProductFormFields productId={productId} suppliers={suppliers} />
    </FormProvider>
  );
};

export default UpdateProductPage;
