import { and, asc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, saleItems, sales } from "@/db/schema";

export async function getSlowMovingProducts(companyId: string) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 90);

  const [slowMovingProducts, totalProductsResult] =
    await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          category: products.category,
          currentStock: products.currentStock,
          location: products.location,
        })
        .from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(
          and(
            eq(sales.companyId, companyId),
            gte(
              sales.saleDate,
              fromDate.toISOString().split("T")[0],
            ),
          ),
        )
        .groupBy(
          products.id,
          products.name,
          products.category,
          products.currentStock,
          products.location
        )
        .orderBy(asc(sql`sum(${saleItems.quantity})`)),

      db
        .select({
          totalProducts: sql<number>`count(*)`,
        })
        .from(products)
        .where(eq(products.companyId, companyId)),
    ]);

  const totalProducts = Number(
    totalProductsResult[0]?.totalProducts ?? 0,
  );

  const slowMovingPercentage =
    totalProducts === 0
      ? 0
      : (slowMovingProducts.length / totalProducts) * 100;

  return {
    count: slowMovingProducts.length,
    percentage: Number(
      slowMovingPercentage.toFixed(2),
    ),
    products: slowMovingProducts,
  };
}