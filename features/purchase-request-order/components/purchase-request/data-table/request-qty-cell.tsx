"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { PurchaseRequestForm } from "@/features/purchase-request-order/validation/purchase-request-form";
import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";
import { TriangleAlert } from "lucide-react";

type RequestQtyCellProps = {
  index: number;
};

export function RequestQtyCell({ index }: RequestQtyCellProps) {
  const { register, watch } = useFormContext<PurchaseRequestForm>();
  const requestedQty = watch(`items.${index}.requestedQty`);

  return (
    <div className="space-y-1">
      <RHFInput<PurchaseRequestForm>
        name={`items.${index}.requestedQty`}
        label=""
        type="number"
      />

      {(!requestedQty || requestedQty <= 0) && (
        <div className="flex items-center gap-1 text-xs font-medium text-amber-600">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
          <span>Reorder quantity not configured.</span>
        </div>
      )}
    </div>
  );
}
