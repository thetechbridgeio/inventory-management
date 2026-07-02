"use client";

import { useState } from "react";
import {
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { SupplierPicker } from "@/features/suppliers/components/supplier-picker";

type SupplierCellApprovalProps<T extends FieldValues> = {
  baseName: Path<T>;
};

export function SupplierCellApproval<T extends FieldValues>({
  baseName,
}: SupplierCellApprovalProps<T>) {
  const { watch, setValue } = useFormContext<T>();

  const [open, setOpen] = useState(false);

  const supplierIdName = `${baseName}.supplierId` as Path<T>;
  const supplierNameName = `${baseName}.supplierName` as Path<T>;
  const decisionName = `${baseName}.decision` as Path<T>;

  const supplierId = watch(supplierIdName) as string | null;
  const supplierName = watch(supplierNameName) as string | null;

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-56 justify-between"
          >
            {supplierName || "Select Supplier"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="start">
          <SupplierPicker
            popover
            value={supplierId ?? undefined}
            onChange={(supplier) => {
              setValue(
                supplierIdName,
                supplier.id as PathValue<T, typeof supplierIdName>,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                },
              );

              setValue(
                supplierNameName,
                supplier.companyName as PathValue<T, typeof supplierNameName>,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                },
              );

              // Default back to approve whenever a supplier is selected.
              setValue(
                decisionName,
                "APPROVE" as PathValue<T, typeof decisionName>,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                },
              );

              setOpen(false);
            }}
            onClear={() => {
              setValue(
                supplierIdName,
                null as PathValue<T, typeof supplierIdName>,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                },
              );

              setValue(
                supplierNameName,
                null as PathValue<T, typeof supplierNameName>,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                },
              );

              // Without a supplier the item requires action.
              setValue(
                decisionName,
                "ACTION_REQUIRED" as PathValue<T, typeof decisionName>,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                },
              );

              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {!supplierId && (
        <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Supplier not assigned.</span>
        </div>
      )}
    </div>
  );
}