import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGetPRProduct } from "../../hooks/use-get-low-stock-products";

export function PurchaseRequestBanner() {
  const { data: lowStockProducts = [], isLoading } = useGetPRProduct();

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-red-50 to-red-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-red-200" />

            <div className="space-y-2">
              <div className="h-5 w-56 animate-pulse rounded bg-red-200" />
              <div className="h-4 w-80 animate-pulse rounded bg-red-100" />
            </div>
          </div>

          <div className="h-10 w-52 animate-pulse rounded-lg bg-red-200" />
        </div>
      </div>
    );
  }

  const lowStockCount = lowStockProducts.length;

  if (lowStockCount === 0) {
    return null;
  }

  const title = `${lowStockCount} ${
    lowStockCount === 1 ? "Product is" : "Products are"
  } Low / Out of Stock`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-red-50 to-red-100 px-6 py-4 shadow-sm">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-red-600" />
      <div className="absolute -right-16 -top-16 h-30 w-30 rounded-full bg-red-300/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-red-950">{title}</h2>

            <p className="mt-1 text-sm text-red-700">
              Generate a Purchase Request to replenish inventory before stock
              runs out.
            </p>
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-lg bg-red-600 px-6 shadow-md transition-all hover:bg-red-700 hover:shadow-lg"
        >
          <Link
            href="/purchase-request/create"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create Purchase Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}