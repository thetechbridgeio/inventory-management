import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, suppliers } from "@/db/schema";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getInventoryOverview(companyId: string) {
  try {
    const [productStats, supplierStats] = await Promise.all([
      db
        .select({
          totalProducts: sql<number>`count(*)`,
          totalStockUnits: sql<number>`coalesce(sum(${products.currentStock}), 0)`,
          totalInventoryValue: sql<number>`coalesce(sum(${products.unitCost} * ${products.currentStock}), 0)`,
          productsWithUnitCostCount: sql<number>`count(*) filter (where ${products.unitCost} is not null)`,
        })
        .from(products)
        .where(eq(products.companyId, companyId)),

      db
        .select({
          totalSuppliers: sql<number>`count(*)`,
        })
        .from(suppliers)
        .where(eq(suppliers.companyId, companyId)),
    ]);

    return {
      totalProducts: Number(productStats[0]?.totalProducts ?? 0),
      totalStockUnits: Number(productStats[0]?.totalStockUnits ?? 0),
      totalSuppliers: Number(supplierStats[0]?.totalSuppliers ?? 0),
      totalInventoryValue: Number(productStats[0]?.totalInventoryValue ?? 0),
      productsWithUnitCostCount: Number(
        productStats[0]?.productsWithUnitCostCount ?? 0,
      ),
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}
