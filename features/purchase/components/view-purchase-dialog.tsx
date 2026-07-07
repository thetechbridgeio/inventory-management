"use client";

import {
  AlertCircle,
  Eye,
  Loader2,
  Package,
  Receipt,
  Truck,
} from "lucide-react";

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

import { usePurchase } from "../hooks/use-purchase";

type ViewPurchaseDialogProps = {
  purchaseId: string;
  children?: React.ReactNode;
};

export function ViewPurchaseDialog({
  purchaseId,
  children,
}: ViewPurchaseDialogProps) {
  const { data, isLoading, isError, error } = usePurchase(purchaseId);

  console.log(data);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="sm">
            <Eye className="mr-2 h-4 w-4" />
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
            <Receipt className="h-4 w-4 text-muted-foreground" />
            Purchase Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium">Failed to load purchase</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Purchase not found
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-5 p-5">
                {/* Summary */}
                <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-5">
                  <div>
                    <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      Purchase Number
                    </p>
                    <h2 className="text-xl font-bold tracking-tight">
                      {data.purchaseNumber}
                    </h2>
                  </div>

                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    {data.items.length} Items
                  </Badge>
                </div>

                {/* Info Cards */}
                <div
                  className={
                    data.image ? "grid gap-5 lg:grid-cols-[1fr_320px]" : ""
                  }
                >
                  <Card className="rounded-xl shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Receipt className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wide">
                          Purchase Info
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Purchase Date
                          </p>
                          <p className="text-sm font-medium">
                            {data.purchaseDate}
                          </p>
                        </div>
                        <div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Supplier Name
                            </p>
                            <p className="text-sm font-medium">
                              {data.supplierName}
                            </p>
                          </div>
                        </div>
                        {data.challanNumber && (
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Challan Number
                            </p>
                            <p className="text-sm font-medium">
                              {data.challanNumber}
                            </p>
                          </div>
                        )}
                        {data.invoiceNumber && (
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Invoice Number
                            </p>
                            <p className="text-sm font-medium">
                              {data.invoiceNumber}
                            </p>
                          </div>
                        )}
                        {data.remarks && (
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Remarks
                            </p>
                            <p className="text-sm font-medium">
                              {data.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  {data.image && (
                    <Card className="overflow-hidden rounded-xl">
                      <CardContent className="p-0">
                        <img
                          src={data.image}
                          alt={data.name}
                          className="h-full w-full object-contain"
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Products */}
                <Card className="overflow-hidden rounded-xl shadow-none">
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Purchased Products
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Unit Cost</TableHead>
                        <TableHead className="text-right text-xs">
                          Line Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {data.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="py-3">
                            <p className="text-sm font-medium">
                              {item.productName}
                            </p>
                          </TableCell>

                          <TableCell className="py-3 text-sm">
                            {item.quantity}
                          </TableCell>

                          <TableCell className="py-3 text-sm">
                            ₹{Number(item.purchasePrice).toLocaleString()}
                          </TableCell>

                          <TableCell className="py-3 text-right text-sm font-semibold">
                            ₹{Number(item.lineTotal).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t bg-muted/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Purchase Value
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    {data.items.length} product
                    {data.items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight">
                  ₹{Number(data.grandTotal).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
