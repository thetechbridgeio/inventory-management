import "server-only";

import { and, count, desc, eq, ilike, inArray, SQL } from "drizzle-orm";

import { db } from "@/db";

import { products } from "../schemas/product.schema";
import { GetProductsParams, GetProductsResponse } from "../types/product.types";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { buildStockStatusFilter } from "./build-stock-status-filter.service";
import { buildProductWhereClause } from "./build-product-filters.service";

export async function getProducts(
  companyId: string,
  {
    page = DEFAULT_PAGE,
    search,
    categories,
    locations,
    stockStatuses,
    stockMovements,
    units,
  }: GetProductsParams,
): Promise<GetProductsResponse> {
  try {
    const whereClause = buildProductWhereClause(companyId, {
      search,
      categories,
      locations,
      units,
      stockStatuses,
      stockMovements,
    });

    const [data, [{ total }]] = await Promise.all([
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
      data,
      page,
      total,
      totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}
