import { eq } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";

export async function getOutOfStockProducts(companyId: string) {
  const outOfStockProducts = await db.query.products.findMany({
    where: (products, { and, eq }) =>
      and(
        eq(products.companyId, companyId),
        eq(products.currentStock, 0),
      ),
    columns: {
      id: true,
      name: true,
      category: true,
      currentStock: true,
      location: true,
    },
  });

  return {
    outOfStockCount: outOfStockProducts.length,
    outOfStockProducts,
  };
}