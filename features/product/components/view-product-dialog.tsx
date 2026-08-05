"use client";

import React from "react";
import {
  AlertCircle,
  Box,
  Eye,
  Loader2,
  MapPin,
  Package,
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

import { useProduct } from "../hooks/use-product";

type ViewProductDialogProps = {
  productId: string;
  children?: React.ReactNode;
};

export function ViewProductDialog({
  productId,
  children,
}: ViewProductDialogProps) {
  const { data, isLoading, isError, error } = useProduct(productId);

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
          width: "min(75vw, 900px)",
          maxWidth: "min(75vw, 900px)",
          height: "75vh",
          maxHeight: "75vh",
        }}
      >
        <DialogHeader className="shrink-0 border-b bg-background p-5">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-muted-foreground" />
            Product Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />

            <p className="text-sm font-medium">Failed to load product</p>

            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        ) : !data ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Product not found
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 min-h-0">
              <div className="space-y-5 p-5">
                <div className="space-y-5">
                  <div
                    className={
                      data.images.length > 0
                        ? "grid gap-5 lg:grid-cols-[1fr_320px]"
                        : ""
                    }
                  >
                    <div className="space-y-5">
                      <div className="flex items-start justify-between rounded-xl border bg-muted/40 p-5">
                        <div className="space-y-2">
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Product Name
                            </p>

                            <h2 className="text-xl font-bold tracking-tight">
                              {data.name}
                            </h2>
                          </div>

                          <Badge variant="secondary">{data.category}</Badge>
                        </div>

                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Current Stock
                          </p>

                          <p className="text-2xl font-bold">
                            {data.currentStock}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {data.unit}
                          </p>
                        </div>
                      </div>

                      {data.description && (
                        <Card className="rounded-xl shadow-none">
                          <CardContent className="p-4">
                            <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                              Description
                            </p>

                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {data.description}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {data.images.length > 0 && (
                      <Card className="overflow-hidden rounded-xl">
                        <CardContent className="p-0">
                          <img
                            src={data.images[0]}
                            alt={data.name}
                            className="h-full w-full object-contain"
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Inventory + Ordering */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="rounded-xl shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Box className="h-4 w-4" />

                        <span className="text-xs font-medium uppercase tracking-wide">
                          Inventory Information
                        </span>
                      </div>

                      <Separator />

                      <div className="grid gap-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Opening Stock
                          </p>

                          <p className="text-sm font-medium">
                            {data.openingStock}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Current Stock
                          </p>

                          <p className="text-sm font-medium">
                            {data.currentStock}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Unit
                          </p>

                          <p className="text-sm font-medium">{data.unit}</p>
                        </div>

                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Unit Cost
                          </p>

                          <p className="text-sm font-medium">
                            {data.unitCost != null
                              ? `₹${Number(data.unitCost).toFixed(2)}`
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Total Value
                          </p>

                          <p className="text-sm font-medium">
                            {data.unitCost != null
                              ? `₹${(
                                  Number(data.unitCost) * data.currentStock
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : "-"}
                          </p>
                        </div>

                        {data.location && (
                          <div>
                            <p className="text-[11px] text-muted-foreground">
                              Location
                            </p>

                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />

                              <span className="text-sm font-medium">
                                {data.location}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />

                        <span className="text-xs font-medium uppercase tracking-wide">
                          Ordering Information
                        </span>
                      </div>

                      <Separator />

                      <div className="grid gap-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Minimum Order Qty
                          </p>

                          <p className="text-sm font-medium">
                            {data.minOrderQty}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Maximum Order Qty
                          </p>

                          <p className="text-sm font-medium">
                            {data.maxOrderQty ?? "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-muted-foreground">
                            Reorder Quantity
                          </p>

                          <p className="text-sm font-medium">
                            {data.reorderQty}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Suppliers */}
                <Card className="overflow-hidden rounded-xl shadow-none">
                  <div className="flex items-center gap-2 border-b px-4 py-3">
                    <Truck className="h-4 w-4 text-muted-foreground" />

                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {data?.suppliers
                        ? `Suppliers (${data.suppliers.length})`
                        : "No Suppliers"}
                    </span>
                  </div>

                  {!data.suppliers ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No suppliers linked to this product
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Lead Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {data.suppliers.length > 0 ? (
                          data.suppliers.map((supplier: any) => (
                            <TableRow key={supplier.id}>
                              <TableCell className="font-medium">
                                {supplier.companyName}
                              </TableCell>

                              <TableCell>
                                {supplier.contactPersonName ?? "-"}
                              </TableCell>

                              <TableCell>{supplier.phone ?? "-"}</TableCell>

                              <TableCell>
                                {supplier.estimatedDeliveryPeriod
                                  ? `${supplier.estimatedDeliveryPeriod} days`
                                  : "-"}
                              </TableCell>

                              <TableCell>
                                <Badge
                                  variant={
                                    supplier.isActive ? "default" : "secondary"
                                  }
                                >
                                  {supplier.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-28 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Truck className="h-8 w-8 text-muted-foreground/50" />

                                <div>
                                  <p className="font-medium">
                                    No suppliers linked
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    This product does not have any associated
                                    suppliers.
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t bg-muted/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Created At</p>

                  <p className="text-sm font-medium">
                    {new Date(data.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Last Updated</p>

                  <p className="text-sm font-medium">
                    {new Date(data.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
