import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  productSuppliers,
  purchaseItems,
  saleItems,
} from "@/db/schema";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function deleteProduct(
  productId: string,
  companyId: string,
) {
  try {
    const product = await db.query.products.findFirst({
      where: (products, { and, eq }) =>
        and(
          eq(products.id, productId),
          eq(products.companyId, companyId),
        ),
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const [purchaseReference] = await db
      .select({ id: purchaseItems.id })
      .from(purchaseItems)
      .where(eq(purchaseItems.productId, productId))
      .limit(1);

    if (purchaseReference) {
      throw new BusinessRuleError(
        "Product cannot be deleted because it has purchase history."
      );
    }

    const [saleReference] = await db
      .select({ id: saleItems.id })
      .from(saleItems)
      .where(eq(saleItems.productId, productId))
      .limit(1);

    if (saleReference) {
      throw new BusinessRuleError(
        "Product cannot be deleted because it has sales history."
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(productSuppliers)
        .where(eq(productSuppliers.productId, productId));

      await tx
        .delete(products)
        .where(
          and(
            eq(products.id, productId),
            eq(products.companyId, companyId),
          ),
        );
    });
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }

    mapDatabaseError(error);
  }
}