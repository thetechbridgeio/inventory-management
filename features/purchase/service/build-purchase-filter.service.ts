import { suppliers } from "@/db/schema";
import { eq, gte, lte, inArray, ilike, and, asc, desc } from "drizzle-orm";
import { purchases } from "../schemas/purchase.schema";
import { GetPurchasesParams } from "../types/purchase.type";

export function buildPurchaseFiltersAndSorting(
  companyId: string,
  {
    startDate,
    endDate,
    supplierIds,
    sortBy,
    search,
    sortOrder = "asc",
  }: GetPurchasesParams = {},
) {
  const filters = [eq(purchases.companyId, companyId)];

  if (startDate) {
    filters.push(gte(purchases.purchaseDate, startDate));
  }

  if (endDate) {
    filters.push(lte(purchases.purchaseDate, endDate));
  }

  if (supplierIds?.length) {
    filters.push(inArray(purchases.supplierId, supplierIds));
  }

  if (search?.trim()) {
    filters.push(ilike(purchases.purchaseNumber, `%${search.trim()}%`));
  }

  const whereClause = and(...filters);

  const orderBy =
    sortBy === "supplier"
      ? sortOrder === "asc"
        ? asc(suppliers.companyName)
        : desc(suppliers.companyName)
      : sortBy === "grandTotal"
        ? sortOrder === "asc"
          ? asc(purchases.grandTotal)
          : desc(purchases.grandTotal)
        : desc(purchases.createdAt);

  return {
    whereClause,
    orderBy,
  };
}