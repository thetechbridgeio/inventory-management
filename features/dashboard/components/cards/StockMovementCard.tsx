import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export type StockMovementCardProps = {
  totalPoductCount: number
  fastMovingCount: number;
  fastMovingPercentage: number;
  slowMovingCount: number;
  slowMovingPercentage: number;
  deadStockCount: number;
  deadStockPercentage: number;
};

const SEGMENTS = [
  {
    key: "fast",
    label: "Fast moving",
    color: "#16a34a",
    badgeClass:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    key: "slow",
    label: "Slow moving",
    color: "#d97706",
    badgeClass:
      "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  {
    key: "dead",
    label: "Dead stock",
    color: "#dc2626",
    badgeClass:
      "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { label, count, percentage } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        {count.toLocaleString()} products · {percentage.toFixed(1)}%
      </p>
    </div>
  );
};

export function StockMovementCard({
  totalPoductCount,
  fastMovingCount,
  fastMovingPercentage,
  slowMovingCount,
  slowMovingPercentage,
  deadStockCount,
  deadStockPercentage,
}: StockMovementCardProps) {
  const data = [
    {
      key: "fast",
      label: "Fast moving",
      count: fastMovingCount,
      percentage: fastMovingPercentage,
      value: fastMovingPercentage,
    },
    {
      key: "slow",
      label: "Slow moving",
      count: slowMovingCount,
      percentage: slowMovingPercentage,
      value: slowMovingPercentage,
    },
    {
      key: "dead",
      label: "Dead stock",
      count: deadStockCount,
      percentage: deadStockPercentage,
      value: deadStockPercentage,
    },
  ];

  const totalProducts = totalPoductCount

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Stock movement
        </CardTitle>
      </CardHeader>
     <CardContent>
  <div className="space-y-5">
    {/* Chart + Stats */}
    <div className="flex items-center justify-center gap-8">
      {/* Donut chart */}
      <div
        className="relative shrink-0"
        style={{ width: 130, height: 130 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => {
                const seg = SEGMENTS.find((s) => s.key === entry.key)!;
                return <Cell key={entry.key} fill={seg.color} />;
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">
            {totalProducts.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Products
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {data.map((entry) => {
          const seg = SEGMENTS.find((s) => s.key === entry.key)!;

          return (
            <div
              key={entry.key}
              className="flex items-center justify-end gap-3"
            >
              <Badge
                variant="outline"
                className={`text-xs ${seg.badgeClass}`}
              >
                {entry.count.toLocaleString()}
              </Badge>

              <span className="text-sm font-semibold">
                {entry.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>

    {/* Bottom Legend */}
    <div className="flex flex-col gap-2 border-t pt-3">
      {SEGMENTS.map((seg) => (
        <div key={seg.key} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: seg.color }}
          />
          <span className="text-sm text-muted-foreground">
            {seg.label}
          </span>
        </div>
      ))}
    </div>
  </div>
</CardContent>
    </Card>
  );
}
