import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema";

export async function getTemplateSuppliers(companyId: string) {
  return db.query.suppliers.findMany({
    where: eq(suppliers.companyId, companyId),
    columns: {
      id: true,
      companyName: true,
    },
    orderBy: asc(suppliers.companyName),
  });
}
