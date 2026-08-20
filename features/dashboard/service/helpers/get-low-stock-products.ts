import { and, eq, gt, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";

export async function getLowStockProducts(companyId: string) {
  const lowStockProducts = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      currentStock: products.currentStock,
      minOrderQty: products.minOrderQty,
      location: products.location,
    })
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),

        // Low stock threshold configured
        gt(products.minOrderQty, 0),

        // Not out of stock
        gt(products.currentStock, 0),

        // Current stock has fallen below min level
        sql`${products.currentStock} < ${products.minOrderQty}`,
      ),
    )
    .orderBy(products.currentStock);

  return {
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
  };
}