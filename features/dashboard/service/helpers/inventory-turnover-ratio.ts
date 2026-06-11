import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  saleItems,
  sales,
} from "@/db/schema";

export async function getInventoryTurnoverRatio(
  companyId: string,
) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 90);

  const [stockResult, salesResult] = await Promise.all([
    db
      .select({
        totalStock: sql<number>`
          coalesce(sum(${products.currentStock}),0)
        `,
      })
      .from(products)
      .where(eq(products.companyId, companyId)),

    db
      .select({
        totalSold: sql<number>`
          coalesce(sum(${saleItems.quantity}),0)
        `,
      })
      .from(saleItems)
      .innerJoin(
        sales,
        eq(saleItems.saleId, sales.id),
      )
      .where(
        and(
          eq(sales.companyId, companyId),
          gte(
            sales.saleDate,
            fromDate.toISOString().split("T")[0],
          ),
        ),
      ),
  ]);

  const totalStock = Number(stockResult[0]?.totalStock ?? 0);
  const totalSold = Number(salesResult[0]?.totalSold ?? 0);

  return {
    inventoryTurnoverRatio:
      totalStock === 0
        ? 0
        : Number((totalSold / totalStock).toFixed(2)),
  };
}