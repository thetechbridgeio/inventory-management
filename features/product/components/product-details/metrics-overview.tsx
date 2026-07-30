'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ShoppingCart, TrendingUp, Package, Wallet, Coins } from 'lucide-react';
import { ProductMetrics } from '../../types/product-details.type';

interface MetricsOverviewProps {
  metrics: ProductMetrics;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const profitPerUnit = metrics.averageSellingPrice - metrics.averagePurchasePrice;
  const totalProfit = profitPerUnit * metrics.totalSoldQty;
  const totalValue =
    metrics.unitCost != null ? metrics.unitCost * metrics.currentStock : null;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-6">Key Metrics</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Inventory Section */}
        <MetricCard
          title="Current Stock"
          value={metrics.currentStock.toString()}
          subtitle="Units in warehouse"
          icon={<Package className="h-5 w-5" />}
          color="bg-blue-50 text-blue-700"
          borderColor="border-blue-200"
        />

        <MetricCard
          title="Unit Cost"
          value={metrics.unitCost != null ? `₹${metrics.unitCost.toFixed(2)}` : 'N/A'}
          subtitle="Cost price per unit"
          icon={<Wallet className="h-5 w-5" />}
          color="bg-teal-50 text-teal-700"
          borderColor="border-teal-200"
        />

        <MetricCard
          title="Total Value"
          value={totalValue != null ? `₹${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
          subtitle="Unit cost × current stock"
          icon={<Coins className="h-5 w-5" />}
          color="bg-indigo-50 text-indigo-700"
          borderColor="border-indigo-200"
        />

        {/* Purchase Section */}
        <MetricCard
          title="Total Purchased"
          value={`${metrics.totalPurchasedQty.toLocaleString()}`}
          subtitle={`₹${metrics.totalPurchaseValue.toLocaleString()}`}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="bg-purple-50 text-purple-700"
          borderColor="border-purple-200"
        />

        {/* Sales Section */}
        <MetricCard
          title="Total Sold"
          value={`${metrics.totalSoldQty.toLocaleString()}`}
          subtitle={`₹${metrics.totalSalesValue.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-green-50 text-green-700"
          borderColor="border-green-200"
        />

        {/* Profit Section */}
        <MetricCard
          title="Total Profit"
          value={`₹${totalProfit.toLocaleString()}`}
          subtitle={`Per unit: ₹${profitPerUnit.toFixed(2)}`}
          icon={<BarChart3 className="h-5 w-5" />}
          color="bg-amber-50 text-amber-700"
          borderColor="border-amber-200"
        />
      </div>

      {/* Detailed Metrics Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailMetricCard
          label="Average Purchase Price"
          value={`₹${metrics.averagePurchasePrice.toFixed(2)}`}
          latest={`Latest: ₹${metrics.latestPurchasePrice?.toFixed(2) || 'N/A'}`}
          date={metrics.lastPurchaseDate ? formatDate(metrics.lastPurchaseDate) : 'N/A'}
        />

        <DetailMetricCard
          label="Average Selling Price"
          value={`₹${metrics.averageSellingPrice.toFixed(2)}`}
          latest={`Latest: ₹${metrics.latestSellingPrice?.toFixed(2) || 'N/A'}`}
          date={metrics.lastSaleDate ? formatDate(metrics.lastSaleDate) : 'N/A'}
        />

        {/* <DetailMetricCard
          label="Stock Turnover"
          value={`${(metrics.totalSoldQty / metrics.currentStock).toFixed(2)}x`}
          latest={`Opening: ${metrics.openingStock} units`}
          date={`Current: ${metrics.currentStock} units`}
        /> */}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  borderColor,
}: MetricCardProps) {
  return (
    <Card className={`border-2 ${borderColor} bg-card`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`rounded-lg p-2.5 ${color}`}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

interface DetailMetricCardProps {
  label: string;
  value: string;
  latest: string;
  date: string;
}

function DetailMetricCard({ label, value, latest, date }: DetailMetricCardProps) {
  return (
    <Card className="bg-card border border-border">
      <CardContent>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {label}
        </div>
        <div className="text-2xl font-bold text-foreground mb-3">{value}</div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>{latest}</div>
          <div>{date}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
