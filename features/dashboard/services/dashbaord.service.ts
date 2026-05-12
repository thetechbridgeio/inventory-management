import { getTotalInventoryValue } from "./inventory.service"
import { getTotalSalesValue } from "./sales.service"
import { getTotalPurchaseValue } from "./purchase.service"
import { getStockStatus } from "./stock.service"
import { getTotalSuppliers } from "./supplier.service"

export function getDashboardMetrics({
  inventory,
  sales,
  purchases,
  suppliers,
}: any) {
  return {
    totalInventoryValue: getTotalInventoryValue(inventory),

    totalSalesValue: getTotalSalesValue(sales, inventory),

    totalPurchaseValue: getTotalPurchaseValue(purchases, inventory),

    stockStatus: getStockStatus(inventory),

    totalSuppliers: getTotalSuppliers(suppliers),
  }
}
