import "server-only";

import { db } from "@/db";

import { products } from "../../schemas/product.schema";
import { ParsedProductRow } from "../../types/parsed-product-row";

export async function createBulkProducts(
  rows: ParsedProductRow[],
  companyId: string,
) {
  return db.transaction(async (tx) => {
    return tx
      .insert(products)
      .values(
        rows.map((row) => ({
          companyId,
          name: row.name.trim(),
          description: row.description?.trim() || null,
          category: row.category.trim(),
          unit: row.unit.trim(),
          minOrderQty: row.minOrderQty,
          maxOrderQty: row.maxOrderQty,
          reorderQty: row.reorderQty,
          openingStock: row.openingStock,
          currentStock: row.openingStock,
          location: row.location?.trim() || null,
        })),
      )
      .returning();
  });
}
