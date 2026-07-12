import { and, eq, gte, ilike, lte, SQL } from "drizzle-orm";
import { processOrders } from "../schemas/process-orders.schema";
import { GetProcessOrdersFilters } from "../types/process-order.types";

export const buildProcessOrderWhereClause = (
  companyId: string,
  filters: GetProcessOrdersFilters,
): SQL => {
  const conditions: SQL[] = [eq(processOrders.companyId, companyId)];

  const search = filters.search?.trim();

  if (search) {
    conditions.push(
      ilike(processOrders.vendorName, `%${search}%`),
    );

  }

  if (filters.fromDate) {
    conditions.push(
      gte(processOrders.createdAt, filters.fromDate),
    );
  }

  if (filters.toDate) {
    conditions.push(
      lte(processOrders.createdAt, filters.toDate),
    );
  }

  return and(...conditions)!;
};