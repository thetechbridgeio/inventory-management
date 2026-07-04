import { and, gt, gte, lt, lte, or, SQL } from "drizzle-orm";

import { products } from "../schemas/product.schema";
import { STOCK_STATUSES, StockStatus } from "../constants/product-stock-status";

export function buildStockStatusFilter(
  statuses?: StockStatus[],
): SQL | undefined {
  if (!statuses?.length) {
    return undefined;
  }

  const filters: SQL[] = [];

  if (statuses.includes(STOCK_STATUSES.LOW)) {
    filters.push(lte(products.currentStock, products.minOrderQty));
  }

  if (statuses.includes(STOCK_STATUSES.SUFFICIENT)) {
    filters.push(
      and(
        gt(products.currentStock, products.minOrderQty),
        lt(products.currentStock, products.maxOrderQty),
      )!,
    );
  }

  if (statuses.includes(STOCK_STATUSES.EXCESS)) {
    filters.push(gte(products.currentStock, products.maxOrderQty));
  }

  return filters.length ? or(...filters)! : undefined;
}
