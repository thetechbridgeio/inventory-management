import "server-only";

import { and, desc, eq, gte, ilike, lte } from "drizzle-orm";

import { db } from "@/db";

import { suppliers } from "../schemas/supplier.schema";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

type GetSuppliersParams = {
  companyId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  estimatedDeliveryPeriod?: number;
  createdFrom?: Date;
  createdTo?: Date;
};

export async function getSuppliers({
  companyId,
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  isActive,
  estimatedDeliveryPeriod,
  createdFrom,
  createdTo,
}: GetSuppliersParams) {
  const where = and(
    eq(suppliers.companyId, companyId),

    search ? ilike(suppliers.companyName, `%${search}%`) : undefined,

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
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
