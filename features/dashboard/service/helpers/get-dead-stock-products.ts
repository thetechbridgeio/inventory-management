import { and, eq, gt, gte, notExists, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, saleItems, sales } from "@/db/schema";

export async function getDeadStockProducts(companyId: string) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 90);

  const [deadStockProducts, totalProductsResult] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        currentStock: products.currentStock,
        location: products.location,
      })
      .from(products)
      .where(
        and(
          eq(products.companyId, companyId),
          gt(products.currentStock, 0),

          notExists(
            db
              .select({ id: sales.id })
              .from(sales)
              .innerJoin(saleItems, eq(saleItems.saleId, sales.id))
              .where(
                and(
                  eq(saleItems.productId, products.id),
                  gte(sales.saleDate, fromDate.toISOString().split("T")[0]),
                ),
              ),
          ),
        ),
      ),

    db
      .select({
        totalProducts: sql<number>`count(*)`,
      })
      .from(products)
      .where(eq(products.companyId, companyId)),
  ]);

  const totalProducts = Number(totalProductsResult[0]?.totalProducts ?? 0);

  const percentage =
    totalProducts === 0 ? 0 : (deadStockProducts.length / totalProducts) * 100;

  return {
    count: deadStockProducts.length,
    percentage: Number(percentage.toFixed(2)),
    products: deadStockProducts,
  };
}
