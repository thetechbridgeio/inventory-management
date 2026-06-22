"use client";

import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDeleteSupplier } from "../hooks/use-delete-supplier";

type DeleteSupplierDialogProps = {
  supplierId: string;
  supplierName: string;
  children?: React.ReactNode;
};

export function DeleteSupplierDialog({
  supplierId,
  supplierName,
  children,
}: DeleteSupplierDialogProps) {
  const { mutateAsync, isPending } = useDeleteSupplier();

  async function handleDelete() {
    await mutateAsync(supplierId);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            variant="ghost"
            className="
              text-red-600
              hover:bg-red-50
              hover:text-red-700
            "
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            <span className="block">This action cannot be undone.</span>

            <span className="block">
              Supplier{" "}
              <span className="font-semibold text-foreground">
                {supplierName}
              </span>{" "}
              will be marked as inactive.
            </span>

            <span className="block">
              Existing purchases and supplier history will be preserved.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="
              bg-red-600
              text-white
              hover:bg-red-700
              focus:ring-red-600
            "
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Supplier"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
