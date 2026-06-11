import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";

import { products } from "@/features/product/schemas/product.schema";

import { purchases } from "../schemas/purchase.schema";
import { purchaseItems } from "../schemas/purchase-item.schema";

export async function deletePurchase(purchaseId: string, companyId: string) {
  return db.transaction(async (tx) => {
    const purchase = await tx.query.purchases.findFirst({
      where: and(
        eq(purchases.id, purchaseId),
        eq(purchases.companyId, companyId),
      ),
      columns: {
        id: true,
        purchaseNumber: true,
      },
    });

    if (!purchase) {
      throw new Error("Purchase not found");
    }

    const items = await tx.query.purchaseItems.findMany({
      where: eq(purchaseItems.purchaseId, purchaseId),
      columns: {
        productId: true,
        quantity: true,
      },
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            currentStock: true,
          },
        },
      },
    });

    for (const item of items) {
      if (item.product.currentStock < item.quantity) {
        throw new Error(
          `Cannot delete purchase. Product "${item.product.name}" has already been consumed from inventory.`,
        );
      }
    }

    for (const item of items) {
      await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    await tx
      .delete(purchaseItems)
      .where(eq(purchaseItems.purchaseId, purchaseId));

    await tx.delete(purchases).where(eq(purchases.id, purchaseId));

    return {
      success: true,
      purchaseId,
      purchaseNumber: purchase.purchaseNumber,
    };
  });
}
