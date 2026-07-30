"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFMultiSelect } from "@/components/react-hook-form-fields/rhf-multiselect";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";

import { useSuppliers } from "@/features/suppliers/hooks/use-get-suppliers";
import { Supplier } from "@/features/suppliers/types/suppliers.type";

import { CREATE_PRODUCT_DEFAULT_VALUES } from "../../constants/form-default";

import { useCreateProduct } from "../../hooks/use-create-product";

import { CreateProductFormType } from "../../types/product.types";

import { CreateProductFormSchema } from "../../validations/product.validation";
import { ImageUpload } from "@/components/react-hook-form-fields/image-upload";

export function CreateProductForm() {
  const { mutateAsync, isPending } = useCreateProduct();

  const { data: suppliersData, isPending: isSupplierPending } = useSuppliers();
  

  const suppliers = suppliersData ?? [];

  const form = useForm<CreateProductFormType>({
    resolver: zodResolver(CreateProductFormSchema),
    defaultValues: CREATE_PRODUCT_DEFAULT_VALUES,
    mode: "onTouched",
  });

  async function onSubmit(values: CreateProductFormType) {
    try {
      await mutateAsync(values);
      form.reset();
    } catch (error) {}
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
                  placeholder="Enter product name"
                  helperText="Enter a unique and descriptive product name."
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="category"
                  label="Category"
                  placeholder="Enter the product category."
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="unit"
                  label="Unit"
                  placeholder="PCS, KG, BOX"
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="location"
                  label="Storage Location"
                  helperText="Where this product is stored."
                />
              </div>

              <div className="mt-6">
                <RHFTextarea<CreateProductFormType>
                  name="description"
                  label="Description"
                  placeholder="Add a product description..."
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
                  helperText="Initial quantity available in inventory."
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="reorderQty"
                  label="Reorder Quantity"
                  type="number"
                  helperText="Low stock threshold for replenishment."
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="minOrderQty"
                  label="Minimum Order Quantity"
                  type="number"
                  helperText="Smallest quantity typically purchased."
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="maxOrderQty"
                  label="Maximum Order Quantity"
                  type="number"
                  helperText="Largest quantity expected in a single purchase."
                  required
                />

                <RHFInput<CreateProductFormType>
                  name="unitCost"
                  label="Unit Cost"
                  type="number"
                  step="0.01"
                  helperText="Cost price per unit, used for inventory valuation."
                />
              </div>
            </section>

            <ImageUpload
              label="Product Image"
              description="Upload a product image"
              value={form.watch("image")}
              onChange={(file) =>
                form.setValue("image", file, {
                  shouldValidate: true,
                })
              }
            />

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
