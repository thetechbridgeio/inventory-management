"use client";

import { Loader2, XCircle } from "lucide-react";

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
import { PRPropDataType } from "../view-PR/view-PR.main";

type RejectPurchaseRequestDialogProps = {
  prData: PRPropDataType;
  isPending?: boolean;
  onReject?: () => Promise<void> | void;
};

export function RejectPurchaseRequestDialog({
  prData,
  isPending = false,
  onReject,
}: RejectPurchaseRequestDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Purchase Request</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            <span className="block">Are you sure you want to reject</span>

            <span className="block font-semibold text-foreground">
              {prData.purchaseRequestNumber}
            </span>

            <span className="block">
              This purchase request will be marked as rejected and no purchase
              orders can be generated from it.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              onReject?.();
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject Purchase Request"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
