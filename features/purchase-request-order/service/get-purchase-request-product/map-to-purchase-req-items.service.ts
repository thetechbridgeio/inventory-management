import {
  EligiblePurchaseRequestProduct,
  PurchaseRequestItem,
} from "../../types/purchase-request.type";

export function mapToPurchaseRequestItems(
  rows: EligiblePurchaseRequestProduct[],
): PurchaseRequestItem[] {
  const map = new Map<string, PurchaseRequestItem>();

  for (const row of rows) {
    if (map.has(row.productId)) continue;

    map.set(row.productId, {
      productId: row.productId,
      productName: row.productName,
      description: row.description ?? "",
      category: row.category,
      unit: row.unit,
      currentStock: row.currentStock,
      minOrderQty: row.minOrderQty,
      maxOrderQty: row.maxOrderQty,
      reorderQty: row.reorderQty,
      requestedQty: row.reorderQty,
      supplierId: row.supplierId ?? null,
      supplierName: row.supplierName ?? null,
    });
  }

  return [...map.values()];
}