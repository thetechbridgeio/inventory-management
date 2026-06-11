import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { purchaseItems } from "../schemas/purchase-item.schema";
import { purchases } from "../schemas/purchase.schema";
import { GetPurchasesParams } from "../types/purchase.type";
import { buildPurchaseFiltersAndSorting } from "./build-purchase-filter.service";

export function buildPurchasesQuery(
  companyId: string,
  params: GetPurchasesParams = {},
) {
  const { whereClause, orderBy } =
    buildPurchaseFiltersAndSorting(companyId, params);

  return db
    .select({
      id: purchases.id,
      purchaseNumber: purchases.purchaseNumber,
      purchaseDate: purchases.purchaseDate,
      supplierName: suppliers.companyName,
      grandTotal: purchases.grandTotal,
      createdAt: purchases.createdAt,
      itemsCount: sql<number>`COUNT(${purchaseItems.id})`,
    })
    .from(purchases)
    .innerJoin(suppliers, eq(suppliers.id, purchases.supplierId))
    .leftJoin(purchaseItems, eq(purchaseItems.purchaseId, purchases.id))
    .where(whereClause)
    .groupBy(purchases.id, suppliers.companyName)
    .orderBy(orderBy);
}