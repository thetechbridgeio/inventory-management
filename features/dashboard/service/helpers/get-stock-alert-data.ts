import { LowStockEmail } from "../../types";
import { getLowStockProducts } from "./get-low-stock-products";
import { getOutOfStockProducts } from "./get-out-of-stock-products";

export async function getStockAlertData(
  companyId: string,
): Promise<LowStockEmail> {
  const [lowStock, outOfStock] = await Promise.all([
    getLowStockProducts(companyId),
    getOutOfStockProducts(companyId),
  ]);

  return {
    lowStockCount: lowStock.lowStockCount,
    lowStockProducts: lowStock.lowStockProducts,
    outOfStockCount: outOfStock.outOfStockCount,
    outOfStockProducts: outOfStock.outOfStockProducts,
  };
}
