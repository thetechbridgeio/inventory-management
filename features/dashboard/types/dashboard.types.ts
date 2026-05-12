export interface DashboardData {
  inventory: {
    totalInventoryItems: number
    totalStockQuantity: number
    totalInventoryValue: number
    lowStockItems: number
    outOfStockItems: number
  }

  purchases: {
    totalPurchases: number
    totalPurchasedQuantity: number
    recentPurchases: any[]
    topSuppliers: any[]
  }

  sales: {
    totalSales: number
    totalSoldQuantity: number
    recentSales: any[]
    topCustomers: any[]
  }

  suppliers: {
    totalSuppliers: number
  }

  alerts: {
    reorderAlerts: number
    overstockAlerts: number
  }

  charts: {
    inventoryByCategory: any[]
    inventoryByProductType: Record<string, number>
  }

  activities: any[]
}
