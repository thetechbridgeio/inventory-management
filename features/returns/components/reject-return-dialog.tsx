"use client";

import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRejectSaleReturn } from "../hooks/use-reject-return";

type RejectReturnDialogProps = {
  returnId: string;
  returnNumber: string;
  onRejected?: () => void;
  children?: React.ReactNode;
};

export function RejectReturnDialog({
  returnId,
  returnNumber,
  onRejected,
  children,
}: RejectReturnDialogProps) {
  const [open, setOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { mutateAsync, isPending } = useRejectSaleReturn();

  async function handleReject() {
    try {
      await mutateAsync({ returnId, rejectionReason });

      toast.success("Return rejected");
      setOpen(false);
      setRejectionReason("");
      onRejected?.();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.error?.message ?? error.response?.data?.message)
        : undefined;

      toast.error(message ?? "Failed to reject return");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Return</DialogTitle>
          <DialogDescription>
            Rejecting <span className="font-semibold text-foreground">{returnNumber}</span>{" "}
            will not change inventory. You can optionally leave a reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Rejection reason</Label>
          <Textarea
            id="rejection-reason"
            placeholder="Optional note for why this return is being rejected"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              "Reject Return"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
