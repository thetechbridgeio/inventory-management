import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import { getProductPurchaseMetrics } from "./get-product-purchase-metrics.service";
import { getProductSaleMetrics } from "./get-product-sale-metrics.service";

export async function getProductMetrics(productId: string, companyId: string) {
  const [product, purchaseMetrics, saleMetrics] = await Promise.all([
    db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.companyId, companyId)),
      columns: {
        openingStock: true,
        currentStock: true,
      },
    }),
    getProductPurchaseMetrics(productId, companyId),
    getProductSaleMetrics(productId, companyId),
  ]);

  if (!product) {
    return null;
  }

  return {
    openingStock: product.openingStock,
    currentStock: product.currentStock,

    totalPurchasedQty: purchaseMetrics.totalPurchasedQty,
    totalPurchaseValue: purchaseMetrics.totalPurchaseValue,
    averagePurchasePrice: purchaseMetrics.averagePurchasePrice,
    latestPurchasePrice: purchaseMetrics.latestPurchasePrice,
    lastPurchaseDate: purchaseMetrics.lastPurchaseDate,

    totalSoldQty: saleMetrics.totalSoldQty,
    totalSalesValue: saleMetrics.totalSalesValue,
    averageSellingPrice: saleMetrics.averageSellingPrice,
    latestSellingPrice: saleMetrics.latestSellingPrice,
    lastSaleDate: saleMetrics.lastSaleDate,
  };
}
