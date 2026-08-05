"use client";

import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFMultiSelect } from "@/components/react-hook-form-fields/rhf-multiselect";
import { RHFSelect } from "@/components/react-hook-form-fields/rhf-select";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { MultiImageUpload } from "@/components/react-hook-form-fields/multi-image-upload";

import { Supplier } from "@/features/suppliers/types/suppliers.type";

import { UpdateProductFormType } from "../../types/product.types";
import { useUpdateProduct } from "../../hooks/use-update-product";
import { STOCK_MOVEMENT_OPTIONS } from "../../constants/product-stock-movement";

type Props = {
  productId: string;
  suppliers: Supplier[];
};

export function UpdateProductFormFields({ productId, suppliers }: Props) {
  const form = useFormContext<UpdateProductFormType>();

  const { mutateAsync, isPending } = useUpdateProduct(productId);

  async function onSubmit(values: UpdateProductFormType) {
    try {
      await mutateAsync(values);
    } catch {}
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="rounded-xl border bg-white shadow-sm">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold">Update Product</h2>

          <p className="text-muted-foreground mt-1 text-sm">
            Modify product information and inventory settings.
          </p>
        </div>

        <div className="space-y-8 p-6">
          {/* Basic Information */}
          <section>
            <div className="mb-5">
              <h3 className="font-semibold">Basic Information</h3>

              <p className="text-muted-foreground text-sm">
                Update product details and category.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <RHFInput<UpdateProductFormType>
                name="name"
                label="Product Name"
                placeholder="Enter product name"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="category"
                label="Category"
                placeholder="Enter product category"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="unit"
                label="Unit"
                placeholder="PCS, KG, BOX"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="location"
                label="Storage Location"
              />
            </div>

            <div className="mt-6">
              <RHFTextarea<UpdateProductFormType>
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
              <RHFInput<UpdateProductFormType>
                name="currentStock"
                label="Current Stock"
                type="number"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="reorderQty"
                label="Reorder Quantity"
                type="number"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="minOrderQty"
                label="Minimum Order Quantity"
                type="number"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="maxOrderQty"
                label="Maximum Order Quantity"
                type="number"
                required
              />

              <RHFInput<UpdateProductFormType>
                name="unitCost"
                label="Unit Cost"
                type="number"
                step="0.01"
                helperText="Cost price per unit, used for inventory valuation."
              />

              <RHFSelect<UpdateProductFormType>
                name="stockMovement"
                label="Stock Movement"
                placeholder="Select stock movement"
                helperText="How this product typically moves through inventory."
                options={STOCK_MOVEMENT_OPTIONS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </div>
          </section>

          {/* Images */}
          <section>
            <div className="mb-5">
              <h3 className="font-semibold">Product Images</h3>

              <p className="text-muted-foreground text-sm">
                Keep, replace, or remove product images. Up to 5 total.
              </p>
            </div>

            <MultiImageUpload
              label="Product Images"
              description="Upload up to 5 images of the product"
              value={form.watch("images")}
              onChange={(images) =>
                form.setValue("images", images, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </section>

          {/* Suppliers */}
          <section>
            <div className="mb-5">
              <h3 className="font-semibold">Supplier Assignment</h3>

              <p className="text-muted-foreground text-sm">
                Select suppliers who provide this product.
              </p>
            </div>

            <RHFMultiSelect<UpdateProductFormType>
              name="supplierIds"
              label="Suppliers"
              options={suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.companyName,
              }))}
            />
          </section>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Updating Product..." : "Update Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
