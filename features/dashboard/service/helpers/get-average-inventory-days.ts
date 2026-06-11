import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, saleItems, sales } from "@/db/schema";

export async function getAverageInventoryDays(companyId: string) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 90);

  const result = await db
    .select({
      averageInventoryDays: sql<number>`
        round(
          avg(
            case
              when coalesce(sold.total_sold, 0) = 0 then null
              else ${products.currentStock}::numeric /
                   (sold.total_sold::numeric / 90)
            end
          ),
          0
        )
      `,
    })
    .from(products)
    .leftJoin(
      sql`
        (
          select
            ${saleItems.productId} as product_id,
            sum(${saleItems.quantity}) as total_sold
          from ${saleItems}
          inner join ${sales}
            on ${saleItems.saleId} = ${sales.id}
          where ${sales.companyId} = ${companyId}
            and ${sales.saleDate} >= ${fromDate.toISOString().split("T")[0]}
          group by ${saleItems.productId}
        ) as sold
      `,
      sql`sold.product_id = ${products.id}`,
    )
    .where(eq(products.companyId, companyId));

  return {
    averageInventoryDays: Number(
      result[0]?.averageInventoryDays ?? 0,
    ),
  };
}