import "server-only";

import { and, eq, gte, ilike, lte } from "drizzle-orm";

import { db } from "@/db";

import { suppliers } from "../schemas/supplier.schema";
import {
  GetSuppliersParams,
  GetSuppliersResponse,
} from "../types/suppliers.type";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getSuppliers(
  companyId: string,
  {
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    search,
    isActive=true,
    estimatedDeliveryPeriod,
    createdFrom,
    createdTo,
  }: GetSuppliersParams,
): Promise<GetSuppliersResponse> {
  try {
    const where = and(
      eq(suppliers.companyId, companyId),
      search?.trim()
        ? ilike(suppliers.companyName, `%${search.trim()}%`)
        : undefined,
      isActive !== undefined ? eq(suppliers.isActive, isActive) : undefined,
      estimatedDeliveryPeriod !== undefined
        ? eq(suppliers.estimatedDeliveryPeriod, estimatedDeliveryPeriod)
        : undefined,
      createdFrom ? gte(suppliers.createdAt, createdFrom) : undefined,
      createdTo ? lte(suppliers.createdAt, createdTo) : undefined,
    );

    const [data, total] = await Promise.all([
      db.query.suppliers.findMany({
        where,
        orderBy: (suppliers, { desc }) => [desc(suppliers.createdAt)],
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),

      db.$count(suppliers, where),
    ]);

    return {
      data,
      page,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}
