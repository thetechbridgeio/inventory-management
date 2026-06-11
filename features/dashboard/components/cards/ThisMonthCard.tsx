import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, Clock } from "lucide-react";

export type ThisMonthCardProps = {
  monthlyPurchaseAmount: number;
  monthlySalesAmount: number;
  monthlySalesGrowthPercentage: number;
  monthlyPurchaseGrowthPercentage: number;
  inventoryTurnoverRatio: number;
  averageInventoryDays: number;
};

function formatCurrency(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function GrowthBadge({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  const isGood = inverse ? value < 0 : value > 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <Badge
      variant="outline"
      className={
        isGood
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
          : "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
      }
    >
      <Icon className="mr-1 h-3 w-3" />
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}

export function ThisMonthCard({
  monthlyPurchaseAmount,
  monthlySalesAmount,
  monthlySalesGrowthPercentage,
  monthlyPurchaseGrowthPercentage,
  inventoryTurnoverRatio,
  averageInventoryDays,
}: ThisMonthCardProps) {
  const stats = [
    {
      label: "Sales amount",
      value: formatCurrency(monthlySalesAmount),
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      badge: <GrowthBadge value={monthlySalesGrowthPercentage} />,
    },
    {
      label: "Purchase amount",
      value: formatCurrency(monthlyPurchaseAmount),
      icon: <TrendingDown className="h-4 w-4 text-muted-foreground" />,
      badge: <GrowthBadge value={monthlyPurchaseGrowthPercentage} inverse />,
    },
    {
      label: "Inventory turnover",
      value: `${inventoryTurnoverRatio.toFixed(1)}×`,
      icon: <RefreshCw className="h-4 w-4 text-muted-foreground" />,
      badge: (
        <Badge
          variant="outline"
          className="border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800"
        >
          Healthy
        </Badge>
      ),
    },
    {
      label: "Avg inventory days",
      value: `${Math.round(averageInventoryDays)}d`,
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      badge: null,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          This month
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {stat.icon}
                {stat.label}
              </div>
              <div className="text-2xl font-semibold tracking-tight">
                {stat.value}
              </div>
              {stat.badge}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
