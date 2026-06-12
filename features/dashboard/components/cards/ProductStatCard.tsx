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

export type DashboardProduct = {
  id: string;
  name: string;
  category: string | null;
  currentStock: number;
  location: string | null;
};

export type ProductStatCardProps = {
  title: string;
  products: DashboardProduct[];
  icon?: LucideIcon;
  variant?: "warning" | "danger";
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
    <div className="flex items-center justify-between border-b border-border/50 py-2.5 last:border-0">
      <div className="min-w-0 flex flex-col gap-0.5">
        <span className="truncate text-sm font-medium">
          {product.name}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{product.category || "Uncategorized"}</span>

          {product.location && (
            <>
              <span>·</span>
              <MapPin className="h-3 w-3" />
              <span>{product.location}</span>
            </>
          )}
        </div>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-2">
        <StockDot variant={variant} />

        <span
          className={`tabular-nums text-sm font-semibold ${styles.stock}`}
        >
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
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </CardTitle>

          <Badge
            variant="outline"
            className={styles.badge}
          >
            {products.length} items
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div>
          {preview.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              variant={variant}
            />
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

            <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle>{title}</DialogTitle>

                  <Badge
                    variant="outline"
                    className={styles.badge}
                  >
                    {products.length} items
                  </Badge>
                </div>
              </DialogHeader>

              <div className="mt-2 flex-1 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">
                        Stock
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {product.category || "Uncategorized"}
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {product.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {product.location}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <span
                            className={`tabular-nums text-sm font-semibold ${styles.stock}`}
                          >
                            {product.currentStock}
                          </span>

                          <span className="ml-1 text-xs text-muted-foreground">
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