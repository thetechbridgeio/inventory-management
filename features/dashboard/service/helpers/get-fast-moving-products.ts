import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, saleItems, sales } from "@/db/schema";

export async function getFastMovingProducts(companyId: string) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);

  const [fastMovingProducts, totalProductsResult] =
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
        )
        .orderBy(desc(sql`sum(${saleItems.quantity})`)),

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

  const fastMovingPercentage =
    totalProducts === 0
      ? 0
      : (fastMovingProducts.length / totalProducts) * 100;

  return {
    count: fastMovingProducts.length,
    percentage: Number(
      fastMovingPercentage.toFixed(2),
    ),
    products: fastMovingProducts,
  };
}