"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFMultiSelect } from "@/components/react-hook-form-fields/rhf-multiselect";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";

import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";
import { Supplier } from "@/features/suppliers/types/suppliers.type";

import { CREATE_PRODUCT_DEFAULT_VALUES } from "../../constants/form-default";
import { PRODUCT_CATEGORY_LABELS } from "../../constants/product-category";

import { useCreateProduct } from "../../hooks/use-create-product";

import {
  CreateProductFormInput,
  CreateProductFormType,
} from "../../types/product.types";

import { CreateProductFormSchema } from "../../validations/product.validation";

export function CreateProductForm() {
  const { mutateAsync, isPending } = useCreateProduct();

  const { data: suppliersData, isPending: isSupplierPending } = useSuppliers();

  const suppliers = suppliersData ?? [];

  const form = useForm<CreateProductFormInput>({
    resolver: zodResolver(CreateProductFormSchema),
    defaultValues: CREATE_PRODUCT_DEFAULT_VALUES,
    mode: "onTouched",
  });

  async function onSubmit(values: CreateProductFormInput) {
    try {
      await mutateAsync(values as CreateProductFormType);

      toast.success("Product created successfully");

      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create product",
      );
    }
  }

  const isLoading = isPending || isSupplierPending;

  if (isSupplierPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />

          <span className="text-muted-foreground">Loading suppliers...</span>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="rounded-xl border bg-white shadow-sm">
          {/* Header */}
          <div className="border-b px-6 py-5">
            <h2 className="text-xl font-semibold">Create Product</h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Add a new product and configure inventory settings.
            </p>
          </div>

          <div className="space-y-8 p-6">
            {/* Basic Information */}
            <section>
              <div className="mb-5">
                <h3 className="font-semibold">Basic Information</h3>

                <p className="text-muted-foreground text-sm">
                  Define the product details and category.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <RHFInput<CreateProductFormType>
                  name="name"
                  label="Product Name"
                  placeholder="e.g. Steel Rod 10mm"
                  helperText="Enter a unique and descriptive product name."
                />

                <RHFSelect<CreateProductFormType>
                  name="category"
                  label="Category"
                  options={Object.entries(PRODUCT_CATEGORY_LABELS).map(
                    ([value, label]) => ({
                      value,
                      label,
                    }),
                  )}
                  helperText="Select the type of inventory item."
                />

                <RHFInput<CreateProductFormType>
                  name="unit"
                  label="Unit"
                  placeholder="PCS, KG, BOX"
                  helperText="Measurement unit used for stock tracking."
                />

                <RHFInput<CreateProductFormType>
                  name="location"
                  label="Storage Location"
                  placeholder="Warehouse A - Rack 12"
                  helperText="Where this product is stored."
                />
              </div>

              <div className="mt-6">
                <RHFTextarea<CreateProductFormType>
                  name="description"
                  label="Description"
                  placeholder="Enter product specifications, dimensions, material details, etc."
                  helperText="Optional notes or additional information."
                />
              </div>
            </section>

            {/* Inventory Configuration */}
            <section>
              <div className="mb-5">
                <h3 className="font-semibold">Inventory Configuration</h3>

                <p className="text-muted-foreground text-sm">
                  Configure stock and purchasing thresholds.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <RHFInput<CreateProductFormType>
                  name="openingStock"
                  label="Opening Stock"
                  type="number"
                  placeholder="100"
                  helperText="Initial quantity available in inventory."
                />

                <RHFInput<CreateProductFormType>
                  name="reorderQty"
                  label="Reorder Quantity"
                  type="number"
                  placeholder="20"
                  helperText="Low stock threshold for replenishment."
                />

                <RHFInput<CreateProductFormType>
                  name="minOrderQty"
                  label="Minimum Order Quantity"
                  type="number"
                  placeholder="10"
                  helperText="Smallest quantity typically purchased."
                />

                <RHFInput<CreateProductFormType>
                  name="maxOrderQty"
                  label="Maximum Order Quantity"
                  type="number"
                  placeholder="500"
                  helperText="Largest quantity expected in a single purchase."
                />
              </div>
            </section>

            {/* Suppliers */}
            <section>
              <div className="mb-5">
                <h3 className="font-semibold">Supplier Assignment</h3>

                <p className="text-muted-foreground text-sm">
                  Select one or more suppliers who can provide this product.
                </p>
              </div>

              <RHFMultiSelect<CreateProductFormType>
                name="supplierIds"
                label="Suppliers"
                options={suppliers.data.map((supplier: Supplier) => ({
                  value: supplier.id,
                  label: supplier.companyName,
                }))}
              />
            </section>
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t px-6 py-4">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isPending ? "Creating Product..." : "Create Product"}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
