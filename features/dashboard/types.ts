export type DashboardProduct = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  location: string | null;
};

export type DashboardStats = {
  totalProducts: number;
  totalStockUnits: number;
  totalSuppliers: number;

  lowStockCount: number;
  outOfStockCount: number;

  fastMovingCount: number;
  fastMovingPercentage: number;

  slowMovingCount: number;
  slowMovingPercentage: number;

  deadStockCount: number;
  deadStockPercentage: number;

  monthlyPurchaseAmount: number;
  monthlySalesAmount: number;

  monthlySalesGrowthPercentage: number;
  monthlyPurchaseGrowthPercentage: number;

  inventoryTurnoverRatio: number;
  averageInventoryDays: number;

  lowStockProducts: DashboardProduct[];
  outOfStockProducts: DashboardProduct[];
  fastMovingProducts: DashboardProduct[];
  slowMovingProducts: DashboardProduct[];
  deadStockProducts: DashboardProduct[];
};
