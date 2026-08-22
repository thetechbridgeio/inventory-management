import "server-only";

import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

import { saleReturns } from "@/features/returns/schemas/sale-return.schema";
import { SALE_RETURN_STATUS } from "@/features/returns/constants/sale-return-status";

import { saleItems } from "../../schemas/sales-item.schema";
import { sales } from "../../schemas/sales.schema";
import { GetSalesParams } from "../../types/sales.type";
import { SALE_RETURN_FLAG, SaleReturnFlag } from "../../constants/sale-return-flag";

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
    const searchTerm = `%${search.trim()}%`;

    filters.push(
      or(
        ilike(sales.saleNumber, searchTerm),
        ilike(sales.soldTo, searchTerm),
      )!,
    );
  }

  const whereClause = and(...filters);

  const itemsAgg = db
    .select({
      saleId: saleItems.saleId,
      itemsCount: sql<number>`COUNT(*)`.as("items_count"),
      totalQty: sql<number>`SUM(${saleItems.quantity})`.as("total_qty"),
      totalReturnedQty: sql<number>`SUM(${saleItems.returnedQty})`.as(
        "total_returned_qty",
      ),
    })
    .from(saleItems)
    .groupBy(saleItems.saleId)
    .as("items_agg");

  const returnsAgg = db
    .select({
      saleId: saleReturns.saleId,
      hasPendingReturn:
        sql<boolean>`BOOL_OR(${saleReturns.status} = ${SALE_RETURN_STATUS.PENDING_APPROVAL})`.as(
          "has_pending_return",
        ),
      hasApprovedReturn:
        sql<boolean>`BOOL_OR(${saleReturns.status} = ${SALE_RETURN_STATUS.APPROVED})`.as(
          "has_approved_return",
        ),
    })
    .from(saleReturns)
    .groupBy(saleReturns.saleId)
    .as("returns_agg");

  const rows = await db
    .select({
      id: sales.id,
      saleNumber: sales.saleNumber,
      saleDate: sales.saleDate,
      grandTotal: sales.grandTotal,
      soldTo: sales.soldTo,
      isWarranty: sales.isWarranty,
      createdAt: sales.createdAt,
      itemsCount: sql<number>`COALESCE(${itemsAgg.itemsCount}, 0)`,
      totalQty: sql<number>`COALESCE(${itemsAgg.totalQty}, 0)`,
      totalReturnedQty: sql<number>`COALESCE(${itemsAgg.totalReturnedQty}, 0)`,
      hasPendingReturn: sql<boolean>`COALESCE(${returnsAgg.hasPendingReturn}, false)`,
      hasApprovedReturn: sql<boolean>`COALESCE(${returnsAgg.hasApprovedReturn}, false)`,
    })
    .from(sales)
    .leftJoin(itemsAgg, eq(itemsAgg.saleId, sales.id))
    .leftJoin(returnsAgg, eq(returnsAgg.saleId, sales.id))
    .where(whereClause)
    .orderBy(
      sortOrder === "asc" ? asc(sales.createdAt) : desc(sales.createdAt),
    )
    .limit(DEFAULT_PAGE_SIZE)
    .offset((page - 1) * DEFAULT_PAGE_SIZE);

  const [{ total }] = await db
    .select({
      total: count(),
    })
    .from(sales)
    .where(whereClause);

  const data = rows.map(
    ({
      hasPendingReturn,
      hasApprovedReturn,
      totalQty,
      totalReturnedQty,
      ...row
    }) => {
      let returnFlag: SaleReturnFlag | null = null;

      if (hasPendingReturn) {
        returnFlag = SALE_RETURN_FLAG.PENDING;
      } else if (hasApprovedReturn) {
        returnFlag =
          Number(totalQty) > 0 && Number(totalReturnedQty) >= Number(totalQty)
            ? SALE_RETURN_FLAG.FULLY_RETURNED
            : SALE_RETURN_FLAG.PARTIALLY_RETURNED;
      }

      return {
        ...row,
        returnFlag,
      };
    },
  );

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
}
