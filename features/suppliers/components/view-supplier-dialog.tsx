"use client";

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Clock3,
  CreditCard,
  User,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useSupplier } from "../hooks/use-supplier";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type ViewSupplierDialogProps = {
  supplierId: string;
  children: React.ReactNode;
};

export function ViewSupplierDialog({
  supplierId,
  children,
}: ViewSupplierDialogProps) {
  const { data: supplier, isLoading } = useSupplier(supplierId);

  console.log("supplier", supplier);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        style={{
          width: "min(72vw, 860px)",
          maxWidth: "min(72vw, 860px)",
          height: "70vh",
          maxHeight: "70vh",
        }}
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Supplier Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading supplier details...
              </div>
            ) : !supplier ? (
              <div className="py-10 text-center text-muted-foreground">
                Supplier not found.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Existing Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {supplier.companyName}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Supplier Information
                      </p>
                    </div>

                    <Badge
                      className={
                        supplier.isActive
                          ? "border-green-200 bg-green-100 text-green-700"
                          : "border-red-200 bg-red-100 text-red-700"
                      }
                    >
                      {supplier.isActive ? (
                        <>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Existing sections unchanged */}
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard
                    icon={<User className="h-4 w-4 text-blue-600" />}
                    label="Contact Person"
                    value={supplier.contactPersonName}
                  />

                  <InfoCard
                    icon={<Mail className="h-4 w-4 text-violet-600" />}
                    label="Email"
                    value={supplier.email}
                  />

                  <InfoCard
                    icon={<Phone className="h-4 w-4 text-green-600" />}
                    label="Phone"
                    value={supplier.phone}
                  />

                  <InfoCard
                    icon={<Receipt className="h-4 w-4 text-orange-600" />}
                    label="GST Number"
                    value={supplier.gst}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 font-medium">Logistics & Payment</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={<Clock3 className="h-4 w-4 text-amber-600" />}
                      label="Estimated Delivery"
                      value={
                        supplier.estimatedDeliveryPeriod
                          ? `${supplier.estimatedDeliveryPeriod} Days`
                          : "-"
                      }
                    />

                    <InfoCard
                      icon={<CreditCard className="h-4 w-4 text-cyan-600" />}
                      label="Payment Term"
                      value={supplier.paymentTerm}
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 font-medium">Address</h3>

                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-red-500" />

                      <p className="text-sm">
                        {supplier.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* NEW PRODUCTS SECTION */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-indigo-600" />

                    <h3 className="font-medium">Supplied Products</h3>

                    <Badge variant="secondary">
                      {supplier.products.length}
                    </Badge>
                  </div>

                  {supplier.products.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No products assigned to this supplier.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {supplier.products.map((product) => (
                        <Card key={product.id}>
                          <CardContent className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-medium">
                                {product.name}
                              </h4>

                              <p className="mt-1 truncate text-sm text-muted-foreground">
                                {product.description || "No description"}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <div className="min-w-[70px] rounded-md bg-muted px-3 py-2 text-center">
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                  Min
                                </p>

                                <p className="font-medium">
                                  {product.minOrderQty}
                                </p>
                              </div>

                              <div className="min-w-[70px] rounded-md bg-muted px-3 py-2 text-center">
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                  Max
                                </p>

                                <p className="font-medium">
                                  {product.maxOrderQty ?? "-"}
                                </p>
                              </div>

                              <div className="min-w-[70px] rounded-md bg-muted px-3 py-2 text-center">
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                  Reorder
                                </p>

                                <p className="font-medium">
                                  {product.reorderQty}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
};

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}

        <span className="text-sm font-medium">{label}</span>
      </div>

      <p className="text-sm text-muted-foreground break-words">
        {value || "-"}
      </p>
    </div>
  );
}
