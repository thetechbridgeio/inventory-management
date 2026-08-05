"use client";

import { AlertCircle, Loader2, Package, Undo2 } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAuth } from "@/features/auth/providers/use-auth.provider";
import { can } from "@/features/auth/constants/permissions";

import { useSaleReturn } from "../hooks/use-return";
import {
  SALE_RETURN_STATUS,
  SALE_RETURN_STATUS_CONFIG,
  SaleReturnStatus,
} from "../constants/sale-return-status";

import { ApproveReturnDialog } from "./approve-return-dialog";
import { RejectReturnDialog } from "./reject-return-dialog";

type ViewReturnDialogProps = {
  returnId: string;
  children?: React.ReactNode;
};

type SaleReturnDetailItem = {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  category: string;
  quantity: number;
};

export function ViewReturnDialog({ returnId, children }: ViewReturnDialogProps) {
  const { data, isLoading, isError, error } = useSaleReturn(returnId);
  const { user } = useAuth();

  const canApprove = can(user?.role, "return:approve");
  const canReject = can(user?.role, "return:reject");

  const isPending = data?.status === SALE_RETURN_STATUS.PENDING_APPROVAL;

  const statusConfig = data
    ? SALE_RETURN_STATUS_CONFIG[data.status as SaleReturnStatus]
    : undefined;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="sm">
            <Undo2 className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="flex flex-col gap-0 overflow-hidden rounded-xl p-0 shadow-2xl"
        style={{
          width: "min(72vw, 860px)",
          maxWidth: "min(72vw, 860px)",
          height: "70vh",
          maxHeight: "70vh",
        }}
      >
        <DialogHeader className="shrink-0 border-b bg-background p-5">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Undo2 className="h-4 w-4 text-muted-foreground" />
            Return Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium">Failed to load return</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Return not found
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-5 p-5">
                <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-5">
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      Return Number
                    </p>
                    <h2 className="text-xl font-bold tracking-tight">
                      {data.returnNumber}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Against sale{" "}
                      <span className="font-mono">{data.sale.saleNumber}</span>
                    </p>
                  </div>

                  <Badge variant="outline" className={statusConfig?.className}>
                    {statusConfig?.label}
                  </Badge>
                </div>

                <Card className="rounded-xl shadow-none">
                  <CardContent className="space-y-4 p-4">
                    <Separator />

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Return Date
                        </p>
                        <p className="text-sm font-medium">
                          {data.returnDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Requested By
                        </p>
                        <p className="text-sm font-medium">
                          {data.createdByUser?.name ?? "—"}
                        </p>
                      </div>

                      {data.reason && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground">
                            Reason
                          </p>
                          <p className="text-sm font-medium">{data.reason}</p>
                        </div>
                      )}

                      {data.status !== SALE_RETURN_STATUS.PENDING_APPROVAL && (
                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            {data.status === SALE_RETURN_STATUS.APPROVED
                              ? "Approved By"
                              : "Reviewed By"}
                          </p>
                          <p className="text-sm font-medium">
                            {data.approvedByUser?.name ?? "—"}
                            {data.approvedAt &&
                              ` · ${format(new Date(data.approvedAt), "dd MMM yyyy, hh:mm a")}`}
                          </p>
                        </div>
                      )}

                      {data.status === SALE_RETURN_STATUS.REJECTED &&
                        data.rejectionReason && (
                          <div className="col-span-2">
                            <p className="text-[11px] text-muted-foreground">
                              Rejection Reason
                            </p>
                            <p className="text-sm font-medium">
                              {data.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-xl shadow-none">
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Returned Products
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs">Unit</TableHead>
                        <TableHead className="text-right text-xs">
                          Quantity
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {data.items.map((item: SaleReturnDetailItem) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-3">
                            <p className="text-sm font-medium">
                              {item.productName}
                            </p>
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {item.category}
                          </TableCell>
                          <TableCell className="py-3 text-sm">
                            {item.unit}
                          </TableCell>
                          <TableCell className="py-3 text-right text-sm font-semibold">
                            {item.quantity}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </ScrollArea>

            {isPending && (canApprove || canReject) && (
              <div className="shrink-0 border-t bg-muted/20 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {data.totalItems} product{data.totalItems !== 1 ? "s" : ""},{" "}
                      {data.totalReturnedQty} unit
                      {data.totalReturnedQty !== 1 ? "s" : ""} pending review
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {canReject && (
                      <RejectReturnDialog
                        returnId={data.id}
                        returnNumber={data.returnNumber}
                      />
                    )}

                    {canApprove && (
                      <ApproveReturnDialog
                        returnId={data.id}
                        returnNumber={data.returnNumber}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
