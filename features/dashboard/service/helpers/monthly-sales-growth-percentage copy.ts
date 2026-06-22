import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/db/schema";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getMonthlySalesGrowthPercentage(companyId: string) {
  try {
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    )
      .toISOString()
      .split("T")[0];

    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    const [current, previous] = await Promise.all([
      db
        .select({
          total: sql<number>`coalesce(sum(${sales.grandTotal}), 0)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.companyId, companyId),
            gte(sales.saleDate, currentMonthStart),
            lte(sales.saleDate, currentMonthEnd),
          ),
        ),

      db
        .select({
          total: sql<number>`coalesce(sum(${sales.grandTotal}), 0)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.companyId, companyId),
            gte(sales.saleDate, previousMonthStart),
            lte(sales.saleDate, previousMonthEnd),
          ),
        ),
    ]);

    const currentSales = Number(current[0]?.total ?? 0);
    const previousSales = Number(previous[0]?.total ?? 0);

    const growthPercentage =
      previousSales === 0
        ? currentSales > 0
          ? 100
          : 0
        : ((currentSales - previousSales) / previousSales) * 100;

    return {
      currentSales,
      previousSales,
      growthPercentage: Number(growthPercentage.toFixed(2)),
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}
