import { sales } from "@/db/schema";
import { eq, gte, lte, ilike, and, asc, desc } from "drizzle-orm";
import { GetSalesParams } from "../../types/sales.type";

export function buildSaleFiltersAndSorting(
  companyId: string,
  {
    startDate,
    endDate,
    search,
    sortOrder = "desc",
  }: GetSalesParams = {},
) {
  const filters = [eq(sales.companyId, companyId)];

  if (startDate) {
    filters.push(gte(sales.saleDate, startDate));
  }

  if (endDate) {
    filters.push(lte(sales.saleDate, endDate));
  }

  if (search?.trim()) {
    filters.push(ilike(sales.saleNumber, `%${search.trim()}%`));
  }

  const whereClause = and(...filters);

  const orderBy =
    sortOrder === "asc"
      ? asc(sales.grandTotal)
      : desc(sales.grandTotal);

  return {
    whereClause,
    orderBy,
  };
}