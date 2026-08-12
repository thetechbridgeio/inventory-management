import { SQL, and, eq, gte, ilike, lte } from "drizzle-orm";

import { saleReturns } from "../schemas/sale-return.schema";
import { GetSaleReturnsParams } from "../types/return.type";

export function buildSaleReturnWhereClause(
  companyId: string,
  { status, startDate, endDate, search }: GetSaleReturnsParams,
): SQL {
  const filters: SQL[] = [eq(saleReturns.companyId, companyId)];

  if (status) {
    filters.push(eq(saleReturns.status, status));
  }

  if (startDate) {
    filters.push(gte(saleReturns.returnDate, startDate));
  }

  if (endDate) {
    filters.push(lte(saleReturns.returnDate, endDate));
  }

  if (search?.trim()) {
    filters.push(ilike(saleReturns.returnNumber, `%${search.trim()}%`));
  }

  return and(...filters)!;
}
