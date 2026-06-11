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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProductCategory = string;

export type DashboardProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  currentStock: number;
  location: string | null;
};

export type ProductStatCardProps = {
  title: string;
  products: DashboardProduct[];
  icon?: LucideIcon;
  /** Controls the badge + stock number colour: "warning" | "danger" */
  variant?: "warning" | "danger";
  /** How many rows to show in the collapsed card (default 4) */
  previewCount?: number;
};

const VARIANT_STYLES = {
  warning: {
    badge:
      "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    stock: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  danger: {
    badge:
      "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    stock: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
};

function StockDot({ variant }: { variant: "warning" | "danger" }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${VARIANT_STYLES[variant].dot}`}
    />
  );
}

function ProductRow({
  product,
  variant,
}: {
  product: DashboardProduct;
  variant: "warning" | "danger";
}) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium truncate">{product.name}</span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{product.category}</span>
          {product.location && (
            <>
              <span>·</span>
              <MapPin className="h-3 w-3" />
              <span>{product.location}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4 shrink-0">
        <StockDot variant={variant} />
        <span className={`text-sm font-semibold tabular-nums ${styles.stock}`}>
          {product.currentStock} units
        </span>
      </div>
    </div>
  );
}

export function ProductStatCard({
  title,
  products,
  variant = "warning",
  previewCount = 4,
}: ProductStatCardProps) {
  const styles = VARIANT_STYLES[variant];
  const preview = products.slice(0, previewCount);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
          <Badge variant="outline" className={styles.badge}>
            {products.length} items
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div>
          {preview.map((p) => (
            <ProductRow key={p.id} product={p} variant={variant} />
          ))}
        </div>

        {products.length > previewCount && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
              >
                View all {products.length} products →
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>{title}</DialogTitle>
                  <Badge variant="outline" className={styles.badge}>
                    {products.length} items
                  </Badge>
                </div>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.category}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {p.location}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`text-sm font-semibold tabular-nums ${styles.stock}`}
                          >
                            {p.currentStock}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            units
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
