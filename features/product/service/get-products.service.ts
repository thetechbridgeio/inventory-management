import "server-only";

import { and, count, desc, eq, ilike, inArray, SQL } from "drizzle-orm";

import { db } from "@/db";

import { products } from "../schemas/product.schema";
import { GetProductsParams } from "../types/product.types";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export async function getProducts(
  companyId: string,
  {
    page = DEFAULT_PAGE,
    search,
    categories,
    locations,
    units,
  }: GetProductsParams,
) {
  const filters: SQL[] = [eq(products.companyId, companyId)];

  if (search?.trim()) {
    filters.push(ilike(products.name, `%${search.trim()}%`));
  }

  if (categories?.length) {
    filters.push(inArray(products.category, categories));
  }

  if (locations?.length) {
    filters.push(inArray(products.location, locations));
  }

  if (units?.length) {
    filters.push(inArray(products.unit, units));
  }

  const whereClause = and(...filters);

  const [items, [{ total }]] = await Promise.all([
    db.query.products.findMany({
      where: whereClause,
      orderBy: [desc(products.createdAt)],
      limit: DEFAULT_PAGE_SIZE,
      offset: (page - 1) * DEFAULT_PAGE_SIZE,
    }),

    db
      .select({
        total: count(),
      })
      .from(products)
      .where(whereClause),
  ]);

  return {
    items,

    pagination: {
      page,
      total,
      totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
    },
  };
}
