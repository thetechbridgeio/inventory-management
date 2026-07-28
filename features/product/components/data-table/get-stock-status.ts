import { STOCK_STATUSES } from "../../constants/product-stock-status";

export function getStockStatus(
  currentStock: number,
  minOrderQty: number,
  maxOrderQty: number,
) {
  if (currentStock === 0) {
    return STOCK_STATUSES.OUT_OF_STOCK;
  }

  if (currentStock <= minOrderQty) {
    return STOCK_STATUSES.LOW;
  }

  if (currentStock >= maxOrderQty) {
    return STOCK_STATUSES.EXCESS;
  }

  return STOCK_STATUSES.SUFFICIENT;
}