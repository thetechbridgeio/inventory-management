import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/features/product/schemas/product.schema";
import { sales } from "../schemas/sales.schema";
import { saleItems } from "../schemas/sales-item.schema";

export async function deleteSale(saleId: string, companyId: string) {
  return db.transaction(async (tx) => {
    const sale = await tx.query.sales.findFirst({
      where: and(eq(sales.id, saleId), eq(sales.companyId, companyId)),

      columns: {
        id: true,
        saleNumber: true,
      },
    });

    if (!sale) {
      throw new Error("Sale not found");
    }

    const items = await tx.query.saleItems.findMany({
      where: eq(saleItems.saleId, saleId),

      columns: {
        productId: true,
        quantity: true,
      },
    });

    for (const item of items) {
      await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} + ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    await tx.delete(saleItems).where(eq(saleItems.saleId, saleId));

    await tx.delete(sales).where(eq(sales.id, saleId));

    return {
      success: true,
      saleId,
      saleNumber: sale.saleNumber,
    };
  });
}
