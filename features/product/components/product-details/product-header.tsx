"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import Image from "next/image";
import { ProductDashboard } from "../../types/product-details.type";

interface ProductHeaderProps {
  product: ProductDashboard;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const { productOverview, metrics } = product;
  const isLowStock = metrics.currentStock < productOverview.minOrderQty;

  const stockStatus =
    metrics.currentStock > productOverview.maxOrderQty
      ? {
          label: "Excess",
          variant: "secondary" as const,
        }
      : metrics.currentStock < productOverview.minOrderQty
        ? {
            label: "Low",
            variant: "destructive" as const,
          }
        : {
            label: "Sufficient",
            variant: "success" as const,
          };

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted border border-border">
              {productOverview.image && (
                <Image
                  src={productOverview.image}
                  alt={productOverview.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {productOverview.name}
                </h1>
                <p className="text-muted-foreground text-sm mb-4">
                  {productOverview.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary">{productOverview.category}</Badge>
                  {isLowStock && (
                    <Badge variant={stockStatus.variant as any}>
                      {stockStatus.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Details */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DetailItem label="Unit" value={productOverview.unit} />
          <DetailItem
            label="Location"
            value={productOverview.location || "N/A"}
          />
          <DetailItem
            label="Reorder Qty"
            value={`${productOverview.reorderQty} ${productOverview.unit}`}
          />
          <DetailItem
            label="Last Updated"
            value={formatDate(productOverview.lastUpdatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background p-3 border border-border">
      <div className="text-xs font-medium text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function formatDate(date?: Date): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
