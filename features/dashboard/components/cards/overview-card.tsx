import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Package, Layers, Truck, AlertTriangle, XCircle } from "lucide-react";

export type OverviewCardProps = {
  totalProducts: number;
  totalStockUnits: number;
  totalSuppliers: number;
  lowStockCount: number;
  outOfStockCount: number;
};

type StatItem = {
  label: string;
  value: number;
  icon: React.ReactNode;
  cardClass?: string;
  badge?: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
};
export function OverviewCard({
  totalProducts,
  totalStockUnits,
  totalSuppliers,
  lowStockCount,
  outOfStockCount,
}: OverviewCardProps) {
  const stats: StatItem[] = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: <Package className="size-5 text-blue-500" />,
      cardClass:
        "border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900",
    },
    {
      label: "Stock Units",
      value: totalStockUnits,
      icon: <Layers className="size-5 text-violet-500" />,
      cardClass:
        "border-violet-200 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-900",
    },
    {
      label: "Suppliers",
      value: totalSuppliers,
      icon: <Truck className="size-5 text-emerald-500" />,
      cardClass:
        "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900",
    },
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: <AlertTriangle className="size-5 text-amber-500" />,
      cardClass:
        "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900",
    },
    {
      label: "Out Of Stock",
      value: outOfStockCount,
      icon: <XCircle className="size-5 text-red-500" />,
      cardClass:
        "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900",
    },
  ];

  return (
    <Card >
      <CardHeader className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
        Overview
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-2 rounded-xl border p-4 shadow-sm w-full",
                stat.cardClass,
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </span>

                <div className="rounded-lg bg-background/70 p-2">
                  {stat.icon}
                </div>
              </div>

              <div className="text-3xl font-bold tracking-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
