"use client";

import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { RHFTextarea } from "@/components/react-hook-form-fields/rhf-textarea";
import { RHFMultiSelect } from "@/components/react-hook-form-fields/rhf-multiselect";
import { UpdateProductFormType } from "../../types/product.types";
import { Supplier } from "@/features/suppliers/types/suppliers.type";
import { ImageUpload } from "@/components/react-hook-form-fields/image-upload";


type UpdateProductFormFieldsProps = {
  suppliers: Supplier[];
  isPending?: boolean;
  image?:string;
};

export function UpdateProductFormFields({
  suppliers,
  isPending,
  image
}: UpdateProductFormFieldsProps) {
  const form = useFormContext<UpdateProductFormType>();

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b px-6 py-5">
        <h2 className="text-xl font-semibold">Update Product</h2>

        <p className="text-muted-foreground mt-1 text-sm">
          Modify product information and supplier assignments.
        </p>
      </div>

      <div className="space-y-8 p-6">
        {/* Basic Information */}
        <section>
          <div className="mb-5">
            <h3 className="font-semibold">Basic Information</h3>

            <p className="text-muted-foreground text-sm">
              Update product details and categorization.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RHFInput<UpdateProductFormType>
              name="name"
              label="Product Name"
              placeholder="e.g. Steel Rod 10mm"
            />

            <RHFInput<UpdateProductFormType>
              name="category"
              label="Category"
              placeholder="e.g. Raw Material, Electronics, Hardware"
            />

            <RHFInput<UpdateProductFormType>
              name="unit"
              label="Unit"
              placeholder="PCS, KG, BOX"
            />

            <RHFInput<UpdateProductFormType>
              name="location"
              label="Storage Location"
              placeholder="Warehouse A - Rack 12"
            />
          </div>

          <div className="mt-6">
            <RHFTextarea<UpdateProductFormType>
              name="description"
              label="Description"
              placeholder="Enter product specifications, dimensions, material details, etc."
            />
          </div>
        </section>

        {/* Inventory Configuration */}
        <section>
          <div className="mb-5">
            <h3 className="font-semibold">Inventory Configuration</h3>

            <p className="text-muted-foreground text-sm">
              Update purchasing and replenishment thresholds.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RHFInput<UpdateProductFormType>
              name="reorderQty"
              label="Reorder Quantity"
              type="number"
              placeholder="20"
            />

            <RHFInput<UpdateProductFormType>
              name="minOrderQty"
              label="Minimum Order Quantity"
              type="number"
              placeholder="10"
            />

            <RHFInput<UpdateProductFormType>
              name="maxOrderQty"
              label="Maximum Order Quantity"
              type="number"
              placeholder="500"
            />
          </div>
        </section>

        {/* Product Image */}
        <ImageUpload
          label="Product Image"
          description="Upload a new image to replace the existing one."
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
              Updating suppliers will replace all existing supplier mappings.
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
    </div>
  );
}