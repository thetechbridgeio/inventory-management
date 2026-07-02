"use client";

import { useEffect } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type DecisionCellProps<T extends FieldValues> = {
  baseName: FieldPath<T>;
};

export function DecisionCell<T extends FieldValues>({
  baseName,
}: DecisionCellProps<T>) {
  const { control, setValue } = useFormContext<T>();

  const supplierId = useWatch({
    control,
    name: `${baseName}.supplierId` as FieldPath<T>,
  });

  const decision = useWatch({
    control,
    name: `${baseName}.decision` as FieldPath<T>,
  });

  const hasSupplier = Boolean(supplierId);

  /**
   * Keep decision in sync with supplier changes.
   *
   * No Supplier
   * - APPROVE -> ACTION_REQUIRED
   * - REJECT -> keep
   * - ACTION_REQUIRED -> keep
   *
   * Supplier Added
   * - ACTION_REQUIRED -> APPROVE
   * - REJECT -> keep
   * - APPROVE -> keep
   */
  useEffect(() => {
    if (hasSupplier) {
      if (decision === "ACTION_REQUIRED") {
        setValue(
          `${baseName}.decision` as FieldPath<T>,
          "APPROVE" as never,
          {
            shouldDirty: true,
            shouldValidate: true,
          },
        );
      }
      return;
    }

    if (decision === "APPROVE") {
      setValue(
        `${baseName}.decision` as FieldPath<T>,
        "ACTION_REQUIRED" as never,
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    }
  }, [hasSupplier, decision, baseName, setValue]);

  return (
    <ToggleGroup
      type="single"
      value={decision}
      onValueChange={(value) => {
        if (!value) return;

        // Cannot manually choose APPROVE without a supplier.
        if (value === "APPROVE" && !hasSupplier) return;

        setValue(`${baseName}.decision` as FieldPath<T>, value as never, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }}
      className="inline-flex justify-start gap-1 rounded-lg border border-border bg-muted/40 p-1"
    >
      <ToggleGroupItem
        value="ACTION_REQUIRED"
        disabled={hasSupplier}
        aria-label="Action Required"
        className={cn(
          "gap-1.5 rounded-md border border-transparent px-3 transition-colors",

          hasSupplier
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-background hover:text-foreground",

          "data-[state=on]:border-amber-200",
          "data-[state=on]:bg-amber-50",
          "data-[state=on]:text-amber-700"
        )}
      >
        <AlertTriangle className="h-4 w-4" />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="APPROVE"
        disabled={!hasSupplier}
        aria-label="Approve"
        className={cn(
          "gap-1.5 rounded-md border border-transparent px-3 transition-colors",

          !hasSupplier
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-background hover:text-foreground",

          "data-[state=on]:border-green-200",
          "data-[state=on]:bg-green-50",
          "data-[state=on]:text-green-700"
        )}
      >
        <Check className="h-4 w-4" />
      </ToggleGroupItem>

      <ToggleGroupItem
        value="REJECT"
        aria-label="Reject"
        className={cn(
          "gap-1.5 rounded-md border border-transparent px-3 transition-colors",
          "hover:bg-background hover:text-foreground",
          "data-[state=on]:border-red-200",
          "data-[state=on]:bg-red-50",
          "data-[state=on]:text-red-700"
        )}
      >
        <X className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}