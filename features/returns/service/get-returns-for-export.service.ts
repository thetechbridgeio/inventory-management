import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/features/sales/schemas/sales.schema";

import { saleReturns } from "../schemas/sale-return.schema";
import { GetSaleReturnsParams } from "../types/return.type";
import { buildSaleReturnWhereClause } from "./build-return-filters.service";

export async function getSaleReturnsForExport(
  companyId: string,
  filters: GetSaleReturnsParams,
) {
  const whereClause = buildSaleReturnWhereClause(companyId, filters);

  return db
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
    .orderBy(desc(saleReturns.createdAt));
}
