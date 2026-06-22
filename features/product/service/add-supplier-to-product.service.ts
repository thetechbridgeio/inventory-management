import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { products, productSuppliers, suppliers } from "@/db/schema";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { ConflictError } from "@/lib/errors/conflict-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export type AddSupplierToProductResult = {
  id: string;
  productId: string;
  supplierId: string;
  createdAt: Date;
};

export async function addSupplierToProduct(
  companyId: string,
  productId: string,
  supplierId: string,
): Promise<AddSupplierToProductResult> {
  try {
    const [product, supplier, existingRelation] = await Promise.all([
      db.query.products.findFirst({
        where: and(
          eq(products.id, productId),
          eq(products.companyId, companyId),
        ),
      }),

      db.query.suppliers.findFirst({
        where: and(
          eq(suppliers.id, supplierId),
          eq(suppliers.companyId, companyId),
        ),
      }),

      db.query.productSuppliers.findFirst({
        where: and(
          eq(productSuppliers.productId, productId),
          eq(productSuppliers.supplierId, supplierId),
          eq(productSuppliers.companyId, companyId),
        ),
      }),
    ]);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    if (existingRelation) {
      throw new ConflictError("Supplier is already linked to this product");
    }

    const [relation] = await db
      .insert(productSuppliers)
      .values({
        companyId,
        productId,
        supplierId,
      })
      .returning();

    return {
      id: relation.id,
      productId: relation.productId,
      supplierId: relation.supplierId,
      createdAt: relation.createdAt,
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ConflictError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
