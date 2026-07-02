"use client";

import { Download, Loader2, Mail, MailCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { PurchaseOrderListItem } from "../../types/purchase-order.type";
import { PURCHASE_ORDER_STATUS } from "../../constants/purchase-order-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PurchaseOrderListProps = {
  purchaseOrders: PurchaseOrderListItem[];
  onExport?: (purchaseOrderId: string) => void;
  onSendEmail?: (purchaseOrderId: string) => void;
  exportingPurchaseOrderId?: string;
  sendingPurchaseOrderId?: string;
};

export function PurchaseOrderList({
  purchaseOrders,
  onExport,
  onSendEmail,
  exportingPurchaseOrderId,
  sendingPurchaseOrderId,
}: PurchaseOrderListProps) {
  if (purchaseOrders.length === 0) return null;

  return (
    <Card className="p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Generated Purchase Orders</h3>
        <p className="text-muted-foreground text-sm">
          {purchaseOrders.length} purchase order
          {purchaseOrders.length > 1 ? "s" : ""} generated from this purchase
          request.
        </p>
      </div>

      <div className="space-y-2">
        {purchaseOrders.map((po) => {
          const emailSent = po.status === PURCHASE_ORDER_STATUS.EMAIL_SENT;

          return (
            <div
              key={po.id}
              className={cn(
                "group flex flex-row items-center justify-between gap-4 rounded-md border border-l-4 bg-card px-4 py-3 transition-all",
                emailSent ? "border-l-green-500" : "border-l-yellow-500",
              )}
            >
              {/* Left: identity + stats + status */}
              <div className="flex min-w-0 items-center gap-4">
                <div className="min-w-[140px]">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {po.purchaseOrderNumber}
                  </p>
                  <p className="text-muted-foreground truncate text-xs leading-tight">
                    {po.supplierName}
                  </p>
                </div>

                <div className="hidden h-8 w-px bg-border sm:block" />

                <div className="hidden items-center gap-5 sm:flex">
                  <div className="text-center">
                    <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                      Items
                    </p>
                    <p className="text-sm font-semibold">{po.totalItems}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                      Qty
                    </p>
                    <p className="text-sm font-semibold">
                      {po.totalOrderedQty}
                    </p>
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-border sm:block" />

                <Badge
                  className={cn(
                    "hidden border font-medium sm:inline-flex",
                    emailSent
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-yellow-200 bg-yellow-50 text-yellow-700",
                  )}
                >
                  {emailSent ? "Email Sent" : "Email Pending"}
                </Badge>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <TooltipProvider delayDuration={150}>
                  {/* Export */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={exportingPurchaseOrderId === po.id}
                        onClick={() => onExport?.(po.id)}
                      >
                        {exportingPurchaseOrderId === po.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export PDF</TooltipContent>
                  </Tooltip>

                  {/* Email Supplier */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={emailSent ? "outline" : "default"}
                        size="icon"
                        disabled={sendingPurchaseOrderId === po.id}
                        className={
                          emailSent
                            ? "h-8 w-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                            : "h-8 w-8"
                        }
                        onClick={() => onSendEmail?.(po.id)}
                      >
                        {sendingPurchaseOrderId === po.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : emailSent ? (
                          <MailCheck className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      {emailSent
                        ? "Resend Email to Supplier"
                        : "Email Supplier"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
