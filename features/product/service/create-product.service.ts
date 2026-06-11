import "server-only";

import { db } from "@/db";

import { products } from "../schemas/product.schema";
import { productSuppliers } from "../schemas/product-supplier.schema";

import {
  CreateProductFormType,
  CreateProductType,
} from "../types/product.types";

export async function createProduct(
  data: CreateProductFormType,
  companyId: string,
) {
  return db.transaction(async (tx) => {
    const modifiedData: CreateProductType = {
      ...data,
      companyId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      unit: data.unit.trim(),
      currentStock: data.openingStock,
      location: data.location?.trim() || null,
    };

    const [product] = await tx
      .insert(products)
      .values(modifiedData)
      .returning();

    if (data.supplierIds.length > 0) {
      await tx.insert(productSuppliers).values(
        data.supplierIds.map((supplierId) => ({
          companyId,
          productId: product.id,
          supplierId,
        })),
      );
    }

    return product;
  });
}
