"use client";

import {
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

import { RHFInput } from "@/components/react-hook-form-fields/rhf-input";

type ApprovedQtyCellProps<T extends FieldValues> = {
  approvedQtyName: Path<T>;
};

export function ApprovedQtyCell<T extends FieldValues>({
  approvedQtyName,
}: ApprovedQtyCellProps<T>) {
  useFormContext<T>();

  return (
    <div className="w-24">
      <RHFInput<T>
        name={approvedQtyName}
        label=""
        type="number"
      />
    </div>
  );
}