import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PurchaseRequestBannerProps = {
  count: number;
};

export function PurchaseRequestBanner({
  count,
}: PurchaseRequestBannerProps) {
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
            <h2 className="text-lg font-semibold text-red-950">
              {count} {count === 1 ? "Product is" : "Products are"} Low / Out of
              Stock
            </h2>

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
          <Link href="/purchase-request">
            Create Purchase Request
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}