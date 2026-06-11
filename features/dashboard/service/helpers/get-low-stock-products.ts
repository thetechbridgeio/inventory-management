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
      location: products.location,
    })
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),
        gt(products.reorderQty, 0),
        sql`${products.currentStock} <= ${products.reorderQty}`,
      ),
    )
    .orderBy(products.currentStock);

  return {
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
  };
}