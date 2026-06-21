"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";

import { useProduct } from "../../hooks/use-product";
import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";

import { UPDATE_PRODUCT_DEFAULT_VALUES } from "../../constants/form-default";
import { UpdateProductFormType } from "../../types/product.types";
import { UpdateProductFormSchema } from "../../validations/product.validation";
import { UpdateProductFormFields } from "./update-form-fields";
import { Supplier } from "@/features/suppliers/types/suppliers.type";

const UpdateProductMain = () => {
  const params = useParams();
  const productId = params.id as string;

  const form = useForm({
    resolver: zodResolver(UpdateProductFormSchema),
    defaultValues: UPDATE_PRODUCT_DEFAULT_VALUES,
  });

 
  const {
    data: product,
    isPending: isProductPending,
    isError: isProductError,
  } = useProduct(productId);

  const {
    data: suppliersResponse,
    isPending: isSuppliersPending,
    isError: isSuppliersError,
  } = useSuppliers();

   const suppliers = suppliersResponse?.data ?? [];

  useEffect(() => {
    if (!product || suppliers.length === 0) {
      return;
    }

    form.reset({
      name: product.name,
      description: product.description ?? "",
      category: product.category,
      unit: product.unit,
      location: product.location ?? "",
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty,
      reorderQty: product.reorderQty,
      currentStock: product.currentStock,
      supplierIds: product.suppliers?.map((supplier: Supplier) => supplier.id) ?? [],
      image: product.image,
    });
  }, [product, suppliers, form]);

  const onSubmit = async (data: UpdateProductFormType) => {
    console.log(data);

    // await updateProductMutation.mutateAsync(data);
  };

  if (isProductPending || isSuppliersPending) {
    return (
      <div className="flex items-center justify-center py-10">
        Loading product...
      </div>
    );
  }

  if (isProductError) {
    return (
      <div className="text-destructive py-10 text-center">
        Failed to load product.
      </div>
    );
  }

  if (isSuppliersError) {
    return (
      <div className="text-destructive py-10 text-center">
        Failed to load suppliers.
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <UpdateProductFormFields suppliers={suppliers} image={product.image}/>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Updating..."
              : "Update Product"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateProductMain;