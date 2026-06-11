import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  products,
  productSuppliers,
  suppliers,
} from "@/db/schema";

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
    throw new Error("Product not found");
  }

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (existingRelation) {
    throw new Error("Supplier is already linked to this product");
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
}