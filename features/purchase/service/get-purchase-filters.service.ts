import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { suppliers } from "@/features/suppliers/schemas/supplier.schema";

export async function getPurchaseFilters(companyId: string) {
  const supplierOptions = await db.query.suppliers.findMany({
    where: eq(suppliers.companyId, companyId),
    columns: {
      id: true,
      companyName: true,
    },
    orderBy: asc(suppliers.companyName),
  });

  return {
    suppliers: supplierOptions,
  };
}
