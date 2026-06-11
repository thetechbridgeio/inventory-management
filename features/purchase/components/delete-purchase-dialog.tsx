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
import { useDeletePurchase } from "../hooks/use-delete-purchase";


type DeletePurchaseDialogProps = {
  purchaseId: string;
  purchaseNumber: string;
  children?: React.ReactNode;
};

export function DeletePurchaseDialog({
  purchaseId,
  purchaseNumber,
  children
}: DeletePurchaseDialogProps) {
  const { mutateAsync, isPending } = useDeletePurchase();

  async function handleDelete() {
    try {
      await mutateAsync(purchaseId);

      toast.success("Purchase deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete purchase",
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
          <AlertDialogTitle>Delete Purchase</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            <span className="block">This action cannot be undone.</span>

            <span className="block">
              Purchase{" "}
              <span className="font-semibold text-foreground">
                {purchaseNumber}
              </span>{" "}
              will be permanently deleted.
            </span>

            <span className="block">
              Associated purchase items and inventory adjustments will also be
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
              "Delete Purchase"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
