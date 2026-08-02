import "server-only";

import { db } from "@/db";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

import { products } from "../../schemas/product.schema";
import { ParsedProductRow } from "../../types/parsed-product-row";

export async function createBulkProducts(
  rows: ParsedProductRow[],
  companyId: string,
) {
  try {
    return await db.transaction(async (tx) => {
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
            unitCost:
              row.unitCost !== undefined ? row.unitCost.toFixed(2) : null,
            location: row.location?.trim() || null,
          })),
        )
        .returning();
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}
