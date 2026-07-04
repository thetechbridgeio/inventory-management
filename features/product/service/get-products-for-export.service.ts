import { db } from "@/db";
import { GetProductsParams } from "../types/product.types";
import { buildProductWhereClause } from "./build-product-filters.service";
import { products } from "../schemas/product.schema";
import { desc } from "drizzle-orm";

export async function getProductsForExport(
  companyId: string,
  filters: GetProductsParams,
) {
  const whereClause = buildProductWhereClause(companyId, filters);

  return db.query.products.findMany({
    where: whereClause,
    orderBy: [desc(products.createdAt)],
  });

  

}