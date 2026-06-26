"use client";

import { Controller, useFormContext } from "react-hook-form";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { SupplierPicker } from "@/features/suppliers/components/supplier-picker";
import { PurchaseRequestForm } from "@/features/purchase-request-order/validation/purchase-request-form";
import { TriangleAlert } from "lucide-react";

type SupplierCellProps = {
  index: number;
  supplierName?: string | null;
};

export function SupplierCell({ index }: SupplierCellProps) {
  const { control, watch, setValue } = useFormContext<PurchaseRequestForm>();

  const supplierName = watch(`items.${index}.supplierName`);

  return (
    <div className="space-y-1">
      <Controller
        control={control}
        name={`items.${index}.supplierId`}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-56 justify-between">
                {supplierName || "Select Supplier"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0">
              <SupplierPicker
                popover
                value={field.value}
                onChange={(supplier) => {
                  field.onChange(supplier.id);

                  setValue(
                    `items.${index}.supplierName`,
                    supplier.companyName,
                    {
                      shouldDirty: true,
                    },
                  );
                }}
                onClear={() => {
                  field.onChange("");

                  setValue(`items.${index}.supplierName`, "", {
                    shouldDirty: true,
                  });
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      />
      {!supplierName && (
        <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Supplier not assigned.</span>
        </div>
      )}
    </div>
  );
}
