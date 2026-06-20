"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OverviewCard } from "@/features/dashboard/components/cards/overview-card";
import { ProductCard } from "@/features/dashboard/components/cards/product-card";
import { ProductStatCard } from "@/features/dashboard/components/cards/ProductStatCard";
import { StockMovementCard } from "@/features/dashboard/components/cards/StockMovementCard";
import { ThisMonthCard } from "@/features/dashboard/components/cards/ThisMonthCard";
import { useDashboardStats } from "@/features/dashboard/hooks/use-get-dashboard-stats";
import { Loader2 } from "lucide-react";

const DashboardPage = () => {
  const { data, isPending, error } = useDashboardStats();

  console.log(data);

  if (isPending) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-[60vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
          <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">No dashboard data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Get preview of your current inventory
          </p>
        </div>
        <OverviewCard
          totalProducts={data.totalProducts}
          totalStockUnits={data.totalStockUnits}
          totalSuppliers={data.totalSuppliers}
          lowStockCount={data.lowStockCount}
          outOfStockCount={data.outOfStockCount}
        />
        <ThisMonthCard
          monthlySalesAmount={data.monthlySalesAmount}
          monthlyPurchaseAmount={data.monthlyPurchaseAmount}
          monthlySalesGrowthPercentage={data.monthlySalesGrowthPercentage}
          monthlyPurchaseGrowthPercentage={data.monthlyPurchaseGrowthPercentage}
          inventoryTurnoverRatio={data.inventoryTurnoverRatio}
          averageInventoryDays={data.averageInventoryDays}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          <StockMovementCard
          totalPoductCount={data.totalProducts}
            fastMovingCount={data.fastMovingCount}
            fastMovingPercentage={data.fastMovingPercentage}
            slowMovingCount={data.slowMovingCount}
            slowMovingPercentage={data.slowMovingPercentage}
            deadStockCount={data.deadStockCount}
            deadStockPercentage={data.deadStockPercentage}
          />
          <ProductStatCard
            title="Low stock alerts"
            products={data.lowStockProducts}
            variant="warning"
          />
          <ProductStatCard
            title="Out of stock"
            products={data.outOfStockProducts}
            variant="danger"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "1rem",
          }}
        >
          <ProductCard
            title="Top fast movers"
            products={data.fastMovingProducts}
            previewCount={4}
           

          />
          <ProductCard
            title="Top slow movers"
            products={data.slowMovingProducts}
            previewCount={4}
          

          />
          <ProductCard
            title="Top dead stock"
            products={data.deadStockProducts}
            previewCount={4}
       
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
