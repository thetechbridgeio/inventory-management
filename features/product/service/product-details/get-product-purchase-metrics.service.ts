import { and, avg, desc, eq, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { purchaseItems, purchases } from "@/db/schema";

export async function getProductPurchaseMetrics(
  productId: string,
  companyId: string,
) {
  const [metrics] = await db
    .select({
      totalPurchasedQty:
        sql<number>`coalesce(sum(${purchaseItems.quantity}), 0)`,

      totalPurchaseValue:
        sql<number>`coalesce(sum(${purchaseItems.lineTotal}), 0)`,

      averagePurchasePrice:
        sql<number>`coalesce(avg(${purchaseItems.purchasePrice}), 0)`,
    })
    .from(purchaseItems)
    .innerJoin(
      purchases,
      eq(purchaseItems.purchaseId, purchases.id),
    )
    .where(
      and(
        eq(purchaseItems.productId, productId),
        eq(purchases.companyId, companyId),
      ),
    );

  const latestPurchase = await db.query.purchaseItems.findFirst({
    where: eq(purchaseItems.productId, productId),
    columns: {
      purchasePrice: true,
    },
    with: {
      purchase: {
        columns: {
          purchaseDate: true,
          companyId: true,
        },
      },
    },
    orderBy: (purchaseItems, { desc }) => [desc(purchaseItems.purchaseId)],
  });

  return {
    totalPurchasedQty: Number(metrics.totalPurchasedQty),
    totalPurchaseValue: Number(metrics.totalPurchaseValue),
    averagePurchasePrice: Number(metrics.averagePurchasePrice),
    latestPurchasePrice: latestPurchase?.purchasePrice
      ? Number(latestPurchase.purchasePrice)
      : undefined,
    lastPurchaseDate: latestPurchase?.purchase.purchaseDate,
  };
}