"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ImageOff, Share2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductDashboard } from "../../types/product-details.type";

interface ProductHeaderProps {
  product: ProductDashboard;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const { productOverview, metrics } = product;
  const isLowStock = metrics.currentStock < productOverview.minOrderQty;

  const images = productOverview.images ?? [];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images[activeImageIndex] ?? images[0];

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
          {/* Product Images */}
          <div className="flex-shrink-0 space-y-2">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted border border-border">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={productOverview.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-1.5">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "relative h-10 w-10 shrink-0 overflow-hidden rounded-md border transition-colors",
                      index === activeImageIndex
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${productOverview.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
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
