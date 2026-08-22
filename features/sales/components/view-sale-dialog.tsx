"use client";

import React from "react";
import {
  AlertCircle,
  Eye,
  Loader2,
  Package,
  Receipt,
  ShieldCheck,
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

import { useSale } from "../hooks/use-sale";

type ViewSaleDialogProps = {
  saleId: string;
  children?: React.ReactNode;
};

export function ViewSaleDialog({ saleId, children }: ViewSaleDialogProps) {
  const { data, isLoading, isError, error } = useSale(saleId);

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
            Sale Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />

            <p className="text-sm font-medium">Failed to load sale</p>

            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Sale not found
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-5 space-y-5">
                <div
                  className={
                    data.image ? "grid gap-5 lg:grid-cols-[1fr_320px] " : ""
                  }
                >
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-5">
                      <div>
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                          Sale Number
                        </p>

                        <h2 className="text-xl font-bold tracking-tight">
                          {data.saleNumber}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {data.isWarranty && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Warranty
                          </Badge>
                        )}

                        <Badge variant="secondary" className="px-3 py-1 text-xs">
                          {data.items.length} Items
                        </Badge>
                      </div>
                    </div>

                    {/* Sale Info */}
                    <Card className="rounded-xl shadow-none">
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Receipt className="h-3.5 w-3.5" />

                          <span className="text-xs font-medium uppercase tracking-wide">
                            Sale Information
                          </span>
                        </div>

                        <Separator />
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Sale Date
                            </p>

                            <p className="text-sm font-medium">
                              {data.saleDate}
                            </p>
                          </div>
                          {data.workOrderNumber && (
                            <div>
                              <p className="text-[11px] text-muted-foreground">
                                Work Order Number
                              </p>
                              <p className="text-sm font-medium">
                                {data.workOrderNumber}
                              </p>
                            </div>
                          )}
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
                  </div>
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
                      Sold Products
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Product</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs">Qty</TableHead>
                        <TableHead className="text-xs">Unit</TableHead>
                        <TableHead className="text-xs">Selling Price</TableHead>
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
                            {item.category}
                          </TableCell>

                          <TableCell className="py-3 text-sm">
                            {item.quantity}
                          </TableCell>

                          <TableCell className="py-3 text-sm">
                            {item.unit}
                          </TableCell>

                          <TableCell className="py-3 text-sm">
                            ₹{Number(item.sellingPrice).toLocaleString("en-IN")}
                          </TableCell>

                          <TableCell className="py-3 text-right text-sm font-semibold">
                            ₹{Number(item.lineTotal).toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="shrink-0 border-t bg-muted/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Sale Value
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    {data.items.length} product
                    {data.items.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight">
                  ₹{Number(data.grandTotal).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
