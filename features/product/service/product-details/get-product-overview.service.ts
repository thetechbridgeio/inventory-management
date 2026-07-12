import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";

export async function getProductOverview(
  productId: string,
  companyId: string,
) {
  const product = await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.companyId, companyId),
    ),
    columns: {
      id: true,
      name: true,
      description: true,
      category: true,
      unit: true,
      minOrderQty: true,
      maxOrderQty: true,
      reorderQty: true,
      openingStock: true,
      currentStock: true,
      location: true,
      image: true,
      updatedAt: true,
    },
  });

  return product ?? null;
}