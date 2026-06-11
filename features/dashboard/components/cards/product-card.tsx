import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { DashboardProduct } from "../../types";

export type ProductCategory = string;

export type ProductCardProps = {
  title?: string;
  products: DashboardProduct[];
  previewCount?: number;
};

function ProductRow({
  product,
  index,
}: {
  product: DashboardProduct;
  index: number;
}) {

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5 transition-colors hover:bg-muted/50">
      {/* name + location */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {product.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          {product.location ? (
            <>
              <MapPin className="h-3 w-3" />
              {product.location}
            </>
          ) : (
            <span className="opacity-40">No location</span>
          )}
        </p>
      </div>

      {/* stock chip */}
      <span className={`shrink-0 gap-1 font-semibold`}>
        {product.currentStock}
      </span>
    </div>
  );
}

export function ProductCard({
  title = "Top fast movers",
  products,
  previewCount = 4,
}: ProductCardProps) {
  const preview = products.slice(0, previewCount);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </CardTitle>
          <Badge
            variant="outline"
            className="border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
          >
            {products.length} products
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 pb-3">
        {preview.length > 0 ? (
          preview.map((product, i) => (
            <ProductRow key={product.id} product={product} index={i} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
            No products found
          </div>
        )}

        {products.length > previewCount && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                View all {products.length} products →
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[80vh] max-w-md flex-col overflow-hidden">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>{title}</DialogTitle>
                  <Badge
                    variant="outline"
                    className="border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                  >
                    {products.length} products
                  </Badge>
                </div>
              </DialogHeader>
              <div className="flex flex-col gap-2 overflow-y-auto py-2">
                {products.map((p, i) => (
                  <ProductRow key={p.id} product={p} index={i} />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
