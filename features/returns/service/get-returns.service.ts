import "server-only";

import { and, asc, count, desc, eq, gte, ilike, lte } from "drizzle-orm";

import { db } from "@/db";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

import { sales } from "@/features/sales/schemas/sales.schema";

import { saleReturns } from "../schemas/sale-return.schema";
import { GetSaleReturnsParams } from "../types/return.type";

export async function getSaleReturns(
  companyId: string,
  {
    page = DEFAULT_PAGE,
    status,
    startDate,
    endDate,
    search,
    sortOrder = "desc",
  }: GetSaleReturnsParams = {},
) {
  const filters = [eq(saleReturns.companyId, companyId)];

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

  const whereClause = and(...filters);

  const data = await db
    .select({
      id: saleReturns.id,
      returnNumber: saleReturns.returnNumber,
      returnDate: saleReturns.returnDate,
      status: saleReturns.status,
      totalItems: saleReturns.totalItems,
      totalReturnedQty: saleReturns.totalReturnedQty,
      createdAt: saleReturns.createdAt,
      saleId: saleReturns.saleId,
      saleNumber: sales.saleNumber,
      soldTo: sales.soldTo,
    })
    .from(saleReturns)
    .innerJoin(sales, eq(sales.id, saleReturns.saleId))
    .where(whereClause)
    .orderBy(
      sortOrder === "asc" ? asc(saleReturns.createdAt) : desc(saleReturns.createdAt),
    )
    .limit(DEFAULT_PAGE_SIZE)
    .offset((page - 1) * DEFAULT_PAGE_SIZE);

  const [{ total }] = await db
    .select({
      total: count(),
    })
    .from(saleReturns)
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
}
