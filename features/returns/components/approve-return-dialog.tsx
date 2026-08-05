"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
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

import { useApproveSaleReturn } from "../hooks/use-approve-return";

type ApproveReturnDialogProps = {
  returnId: string;
  returnNumber: string;
  onApproved?: () => void;
  children?: React.ReactNode;
};

export function ApproveReturnDialog({
  returnId,
  returnNumber,
  onApproved,
  children,
}: ApproveReturnDialogProps) {
  const { mutateAsync, isPending } = useApproveSaleReturn();

  async function handleApprove() {
    try {
      await mutateAsync(returnId);

      toast.success("Return approved — inventory has been updated");
      onApproved?.();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ?? error.response?.data?.message)
        : undefined;

      toast.error(message ?? "Failed to approve return");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve Return</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            <span className="block">Are you sure you want to approve</span>

            <span className="block font-semibold text-foreground">
              {returnNumber}
            </span>

            <span className="block">
              Approving will add the returned quantities back to inventory
              stock. This cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault();
              handleApprove();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve Return"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
