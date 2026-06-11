import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/db/schema";

export async function getMonthlySalesAmount(
  companyId: string,
) {
  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  )
    .toISOString()
    .split("T")[0];

  const [result] = await db
    .select({
      monthlySalesAmount:
        sql<number>`coalesce(sum(${sales.grandTotal}), 0)`,
    })
    .from(sales)
    .where(
      and(
        eq(sales.companyId, companyId),
        gte(sales.saleDate, startDate),
        lte(sales.saleDate, endDate),
      ),
    );

  return {
    monthlySalesAmount: Number(
      result?.monthlySalesAmount ?? 0,
    ),
  };
}