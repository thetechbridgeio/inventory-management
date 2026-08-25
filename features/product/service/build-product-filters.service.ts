// build-product-filters.service.ts

import { SQL, eq, gte, ilike, inArray, lte, and } from "drizzle-orm";
import { products } from "../schemas/product.schema";
import { GetProductsParams } from "../types/product.types";
import { buildStockStatusFilter } from "./build-stock-status-filter.service";

export function buildProductWhereClause(
  companyId: string,
  {
    search,
    categories,
    locations,
    units,
    stockStatuses,
    stockMovements,
    updatedFrom,
    updatedTo,
  }: GetProductsParams,
): SQL {
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

  if (stockMovements?.length) {
    filters.push(inArray(products.stockMovement, stockMovements));
  }

  const stockFilter = buildStockStatusFilter(stockStatuses);

  if (stockFilter) {
    filters.push(stockFilter);
  }

  // updatedAt covers both "added" (createdAt === updatedAt on insert) and
  // "last updated" (bumped by the updatedAt.$onUpdate() hook) in one field.
  if (updatedFrom) {
    filters.push(gte(products.updatedAt, new Date(`${updatedFrom}T00:00:00.000`)));
  }

  if (updatedTo) {
    filters.push(lte(products.updatedAt, new Date(`${updatedTo}T23:59:59.999`)));
  }

  return and(...filters)!;
}