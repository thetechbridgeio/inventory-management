"use client";

import { use } from "react";
import { ProductDashboardMain } from "@/features/product/components/product-details/product-dashboard";
import { useProductDashboard } from "@/features/product/hooks/use-product-detail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Page({ params }: PageProps) {
  const { id } = use(params);

  const { data: product, isLoading, isError, error } = useProductDashboard(id);

  return (
    <>
      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Loading product details...
          </p>
        </div>
      ) : isError ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold">Failed to load product</h2>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          </div>
        </div>
      ) : !product ? (
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground text-sm">Product not found.</p>
        </div>
      ) : (
        <ProductDashboardMain product={product} />
      )}
    </>
  );
}
