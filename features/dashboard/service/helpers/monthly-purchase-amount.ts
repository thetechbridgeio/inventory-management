import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { purchases } from "@/db/schema";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getMonthlyPurchaseAmount(
  companyId: string,
) {
  try {
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
        monthlyPurchaseAmount:
          sql<number>`coalesce(sum(${purchases.grandTotal}), 0)`,
      })
      .from(purchases)
      .where(
        and(
          eq(purchases.companyId, companyId),
          gte(purchases.purchaseDate, startDate),
          lte(purchases.purchaseDate, endDate),
        ),
      );

    return {
      monthlyPurchaseAmount: Number(
        result?.monthlyPurchaseAmount ?? 0,
      ),
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}