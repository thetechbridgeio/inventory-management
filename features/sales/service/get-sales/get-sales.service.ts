import "server-only";

import { and, asc, count, desc, eq, gte, ilike, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { saleItems } from "../../schemas/sales-item.schema";
import { sales } from "../../schemas/sales.schema";
import { GetSalesParams } from "../../types/sales.type";

export async function getSales(
  companyId: string,
  {
    page = DEFAULT_PAGE,
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

  const data = await db
    .select({
      id: sales.id,
      saleNumber: sales.saleNumber,
      saleDate: sales.saleDate,
      grandTotal: sales.grandTotal,
      createdAt: sales.createdAt,
      itemsCount: sql<number>`COUNT(${saleItems.id})`,
    })
    .from(sales)
    .leftJoin(saleItems, eq(saleItems.saleId, sales.id))
    .where(whereClause)
    .groupBy(sales.id)
    .orderBy(
      sortOrder === "asc" ? asc(sales.grandTotal) : desc(sales.grandTotal),
    )
    .limit(DEFAULT_PAGE_SIZE)
    .offset((page - 1) * DEFAULT_PAGE_SIZE);

  const [{ total }] = await db
    .select({
      total: count(),
    })
    .from(sales)
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
}
