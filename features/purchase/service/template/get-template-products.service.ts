import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/features/product/schemas/product.schema";

export async function getTemplateProducts(companyId: string) {
  return db.query.products.findMany({
    where: eq(products.companyId, companyId),
    columns: {
      id: true,
      name: true,
      unit: true,
      category: true,
    },
    orderBy: asc(products.name),
  });
}
