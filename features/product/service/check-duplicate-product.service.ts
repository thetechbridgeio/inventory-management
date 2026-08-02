import "server-only";

import { and, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";

import { ConflictError } from "@/lib/errors/conflict-error";

import { products } from "../schemas/product.schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function assertNoDuplicateProduct(
  tx: Tx,
  companyId: string,
  name: string,
  category: string,
  excludeProductId?: string,
) {
  const [duplicate] = await tx
    .select({ id: products.id })
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),
        sql`lower(trim(${products.name})) = lower(trim(${name}))`,
        sql`lower(trim(${products.category})) = lower(trim(${category}))`,
        excludeProductId ? ne(products.id, excludeProductId) : undefined,
      ),
    )
    .limit(1);

  if (duplicate) {
    throw new ConflictError(
      "A product with the same name and category already exists.",
    );
  }
}
