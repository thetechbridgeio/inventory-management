import { getAverageInventoryDays } from "./helpers/get-average-inventory-days";
import { getDeadStockProducts } from "./helpers/get-dead-stock-products";
import { getFastMovingProducts } from "./helpers/get-fast-moving-products";
import { getLowStockProducts } from "./helpers/get-low-stock-products";
import { getOutOfStockProducts } from "./helpers/get-out-of-stock-products";
import { getSlowMovingProducts } from "./helpers/get-slow-moving-products";
import { getInventoryTurnoverRatio } from "./helpers/inventory-turnover-ratio";
import { getMonthlyPurchaseAmount } from "./helpers/monthly-purchase-amount";
import { getMonthlyPurchaseGrowthPercentage } from "./helpers/monthly-purchase-growth-percentage";
import { getMonthlySalesGrowthPercentage } from "./helpers/monthly-sales-growth-percentage copy";
import { getMonthlySalesAmount } from "./helpers/monthly-sales.amount";
import { getInventoryOverview } from "./helpers/overview";

export async function getDashboardStats(companyId: string) {
  const [
    inventoryOverview,
    lowStock,
    outOfStock,
    fastMoving,
    slowMoving,
    deadStock,
    monthlyPurchaseAmount,
    monthlySalesAmount,
    monthlyPurchaseGrowth,
    monthlySalesGrowth,
    inventoryTurnover,
    averageInventoryDays,
  ] = await Promise.all([
    getInventoryOverview(companyId),
    getLowStockProducts(companyId),
    getOutOfStockProducts(companyId),
    getFastMovingProducts(companyId),
    getSlowMovingProducts(companyId),
    getDeadStockProducts(companyId),
    getMonthlyPurchaseAmount(companyId),
    getMonthlySalesAmount(companyId),
    getMonthlyPurchaseGrowthPercentage(companyId),
    getMonthlySalesGrowthPercentage(companyId),
    getInventoryTurnoverRatio(companyId),
    getAverageInventoryDays(companyId),
  ]);

  return {
    totalProducts: inventoryOverview.totalProducts,
    totalStockUnits: inventoryOverview.totalStockUnits,
    totalSuppliers: inventoryOverview.totalSuppliers,

    lowStockCount: lowStock.lowStockCount,
    lowStockProducts: lowStock.lowStockProducts,

    outOfStockCount: outOfStock.outOfStockCount,
    outOfStockProducts: outOfStock.outOfStockProducts,

    fastMovingCount: fastMoving.count,
    fastMovingPercentage: fastMoving.percentage,
    fastMovingProducts: fastMoving.products,

    slowMovingCount: slowMoving.count,
    slowMovingPercentage: slowMoving.percentage,
    slowMovingProducts: slowMoving.products,

    deadStockCount: deadStock.count,
    deadStockPercentage: deadStock.percentage,
    deadStockProducts: deadStock.products,

    monthlyPurchaseAmount: monthlyPurchaseAmount.monthlyPurchaseAmount,

    monthlySalesAmount: monthlySalesAmount.monthlySalesAmount,

    monthlyPurchaseGrowthPercentage: monthlyPurchaseGrowth.growthPercentage,

    monthlySalesGrowthPercentage: monthlySalesGrowth.growthPercentage,

    inventoryTurnoverRatio: inventoryTurnover.inventoryTurnoverRatio,

    averageInventoryDays: averageInventoryDays.averageInventoryDays,
  };
}
