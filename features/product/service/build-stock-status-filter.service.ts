import { and, eq, gt, gte, lt, lte, or, SQL } from "drizzle-orm";

import { products } from "../schemas/product.schema";
import {
  STOCK_STATUSES,
  StockStatus,
} from "../constants/product-stock-status";

export function buildStockStatusFilter(
  statuses?: StockStatus[],
): SQL | undefined {
  if (!statuses?.length) {
    return undefined;
  }

  const filters: SQL[] = [];

  if (statuses.includes(STOCK_STATUSES.OUT_OF_STOCK)) {
    filters.push(eq(products.currentStock, 0));
  }

  if (statuses.includes(STOCK_STATUSES.LOW)) {
    filters.push(
      and(
        gt(products.currentStock, 0),
        lte(products.currentStock, products.minOrderQty),
      )!,
    );
  }

  if (statuses.includes(STOCK_STATUSES.SUFFICIENT)) {
    filters.push(
      and(
        gt(products.currentStock, products.minOrderQty),
        lte(products.currentStock, products.maxOrderQty),
      )!,
    );
  }

  if (statuses.includes(STOCK_STATUSES.EXCESS)) {
    filters.push(gt(products.currentStock, products.maxOrderQty));
  }

  return filters.length ? or(...filters)! : undefined;
}