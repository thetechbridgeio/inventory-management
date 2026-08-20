import { and, eq, lt, notInArray } from "drizzle-orm";

import { db } from "@/db";
import { products, productSuppliers, suppliers } from "@/db/schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { PurchaseRequestProduct } from "../../../types/purchase-request.type";

export async function getEligiblePurchaseRequestProducts(
  companyId: string,
  excludedProductIds: string[],
): Promise<PurchaseRequestProduct[]> {
  try {
    return await db
      .select({
        productId: products.id,
        productName: products.name,
        description: products.description,
        category: products.category,
        unit: products.unit,
        currentStock: products.currentStock,
        minOrderQty: products.minOrderQty,
        maxOrderQty: products.maxOrderQty,
        reorderQty: products.reorderQty,
        supplierId: suppliers.id,
        supplierName: suppliers.companyName,
      })
      .from(products)
      .leftJoin(productSuppliers, eq(productSuppliers.productId, products.id))
      .leftJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
      .where(
        and(
          eq(products.companyId, companyId),
          lt(products.currentStock, products.minOrderQty),
          excludedProductIds.length
            ? notInArray(products.id, excludedProductIds)
            : undefined,
        ),
      );
  } catch (error) {
    console.error("Failed to fetch eligible purchase request products:", error);

    throw mapDatabaseError(
      "Unable to fetch eligible purchase request products.",
    );
  }
}
