import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format-currency";
import {
  Package,
  Layers,
  Truck,
  AlertTriangle,
  XCircle,
  Boxes,
  IndianRupee,
  Info,
} from "lucide-react";

export type OverviewCardProps = {
  totalProducts: number;
  totalStockUnits: number;
  totalSuppliers: number;
  totalInventoryValue: number;
  productsWithUnitCostCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeProcessUnitCount: number;
};

type StatItem = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  cardClass?: string;
  tooltip?: string;
  badge?: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  };
};

function StatTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        <p className="whitespace-pre-line">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function OverviewCard({
  totalProducts,
  totalStockUnits,
  totalSuppliers,
  totalInventoryValue,
  productsWithUnitCostCount,
  lowStockCount,
  outOfStockCount,
  activeProcessUnitCount
}: OverviewCardProps) {
  const inventoryStats: StatItem[] = [
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
      label: "Total Inventory Value",
      value: formatCurrency(totalInventoryValue),
      icon: <IndianRupee className="size-5 text-teal-500" />,
      cardClass:
        "border-teal-200 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-900",
      tooltip: `Exact value: ₹${totalInventoryValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\nCalculated as unit cost × current stock, summed across ${productsWithUnitCostCount} of ${totalProducts} products that have a unit cost set. Products without a unit cost are excluded.`,
    },
    {
      label: "Suppliers",
      value: totalSuppliers,
      icon: <Truck className="size-5 text-emerald-500" />,
      cardClass:
        "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900",
    },
  ];

  const alertStats: StatItem[] = [
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
    {
      label: "Units In Processing",
      value: activeProcessUnitCount,
      icon: <Boxes className="size-5 text-indigo-500" />,
      cardClass:
        "border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-900",
    },
  ];

  return (
    <Card>
      <CardHeader className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
        Overview
      </CardHeader>
      <CardContent className="space-y-5">
        <StatGrid stats={inventoryStats} className="sm:grid-cols-2 lg:grid-cols-4" />
        <StatGrid stats={alertStats} className="sm:grid-cols-3 lg:grid-cols-3" />
      </CardContent>
    </Card>
  );
}

function StatGrid({
  stats,
  className,
}: {
  stats: StatItem[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", className)}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col gap-2 rounded-xl border p-4 shadow-sm",
            stat.cardClass,
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {stat.label}
              {stat.tooltip && <StatTooltip text={stat.tooltip} />}
            </span>

            <div className="rounded-lg bg-background/70 p-2">{stat.icon}</div>
          </div>

          <div className="text-3xl font-bold tracking-tight">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
