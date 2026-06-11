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
import { useDeleteSale } from "../hooks/use-delete-sale";

type DeleteSaleDialogProps = {
  saleId: string;
  saleNumber: string;
  children?: React.ReactNode;
};

export function DeleteSaleDialog({
  saleId,
  saleNumber,
  children,
}: DeleteSaleDialogProps) {
  const { mutateAsync, isPending } = useDeleteSale();

  async function handleDelete() {
    try {
      await mutateAsync(saleId);

      toast.success("Sale deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete sale",
      );
    }
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
          <AlertDialogTitle>Delete Sale</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            <span className="block">This action cannot be undone.</span>

            <span className="block">
              Sale{" "}
              <span className="font-semibold text-foreground">
                {saleNumber}
              </span>{" "}
              will be permanently deleted.
            </span>

            <span className="block">
              Associated sale items and inventory adjustments will also be
              reversed.
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
              "Delete Sale"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
