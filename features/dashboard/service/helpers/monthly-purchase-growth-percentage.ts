import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { purchases } from "@/db/schema";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getMonthlyPurchaseGrowthPercentage(
  companyId: string,
) {
  try {
    const now = new Date();

    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    )
      .toISOString()
      .split("T")[0];

    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    )
      .toISOString()
      .split("T")[0];

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    )
      .toISOString()
      .split("T")[0];

    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
    )
      .toISOString()
      .split("T")[0];

    const [current, previous] = await Promise.all([
      db
        .select({
          total:
            sql<number>`coalesce(sum(${purchases.grandTotal}), 0)`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.companyId, companyId),
            gte(
              purchases.purchaseDate,
              currentMonthStart,
            ),
            lte(
              purchases.purchaseDate,
              currentMonthEnd,
            ),
          ),
        ),

      db
        .select({
          total:
            sql<number>`coalesce(sum(${purchases.grandTotal}), 0)`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.companyId, companyId),
            gte(
              purchases.purchaseDate,
              previousMonthStart,
            ),
            lte(
              purchases.purchaseDate,
              previousMonthEnd,
            ),
          ),
        ),
    ]);

    const currentPurchases = Number(
      current[0]?.total ?? 0,
    );

    const previousPurchases = Number(
      previous[0]?.total ?? 0,
    );

    const growthPercentage =
      previousPurchases === 0
        ? currentPurchases > 0
          ? 100
          : 0
        : ((currentPurchases - previousPurchases) /
            previousPurchases) *
          100;

    return {
      currentPurchases,
      previousPurchases,
      growthPercentage: Number(
        growthPercentage.toFixed(2),
      ),
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}