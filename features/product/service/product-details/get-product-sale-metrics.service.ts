import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { saleItems, sales } from "@/db/schema";

export async function getProductSaleMetrics(
  productId: string,
  companyId: string,
) {
  const [metrics] = await db
    .select({
      totalSoldQty:
        sql<number>`coalesce(sum(${saleItems.quantity}), 0)`,

      totalSalesValue:
        sql<number>`coalesce(sum(${saleItems.lineTotal}), 0)`,

      averageSellingPrice:
        sql<number>`coalesce(avg(${saleItems.sellingPrice}), 0)`,
    })
    .from(saleItems)
    .innerJoin(
      sales,
      eq(saleItems.saleId, sales.id),
    )
    .where(
      and(
        eq(saleItems.productId, productId),
        eq(sales.companyId, companyId),
      ),
    );

  const latestSale = await db
    .select({
      sellingPrice: saleItems.sellingPrice,
      saleDate: sales.saleDate,
    })
    .from(saleItems)
    .innerJoin(
      sales,
      eq(saleItems.saleId, sales.id),
    )
    .where(
      and(
        eq(saleItems.productId, productId),
        eq(sales.companyId, companyId),
      ),
    )
    .orderBy(desc(sales.saleDate))
    .limit(1);

  return {
    totalSoldQty: Number(metrics.totalSoldQty),
    totalSalesValue: Number(metrics.totalSalesValue),
    averageSellingPrice: Number(metrics.averageSellingPrice),
    latestSellingPrice: latestSale[0]
      ? Number(latestSale[0].sellingPrice)
      : undefined,
    lastSaleDate: latestSale[0]?.saleDate,
  };
}