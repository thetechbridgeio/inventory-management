import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  productSuppliers,
  purchaseItems,
  saleItems,
} from "@/db/schema";

export async function deleteProduct(productId: string, companyId: string) {
  const product = await db.query.products.findFirst({
    where: (products, { and, eq }) =>
      and(eq(products.id, productId), eq(products.companyId, companyId)),
  });

  if (!product) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  const [purchaseReference] = await db
    .select({ id: purchaseItems.id })
    .from(purchaseItems)
    .where(eq(purchaseItems.productId, productId))
    .limit(1);

  if (purchaseReference) {
    return {
      success: false,
      message: "Product cannot be deleted because it has purchase history.",
    };
  }

  const [saleReference] = await db
    .select({ id: saleItems.id })
    .from(saleItems)
    .where(eq(saleItems.productId, productId))
    .limit(1);

  if (saleReference) {
    return {
      success: false,
      message: "Product cannot be deleted because it has sales history.",
    };
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(productSuppliers)
      .where(eq(productSuppliers.productId, productId));

    await tx
      .delete(products)
      .where(
        and(eq(products.id, productId), eq(products.companyId, companyId)),
      );
  });

  return {
    success: true,
  };
}
