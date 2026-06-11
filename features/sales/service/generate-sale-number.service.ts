import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "../schemas/sales.schema";

type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

export async function generateSaleNumber(tx: Tx, companyId: string) {
  const lastSale = await tx.query.sales.findFirst({
    where: eq(sales.companyId, companyId),

    columns: {
      saleNumber: true,
    },
    orderBy: desc(sales.saleNumber),
  });

  if (!lastSale) {
    return "SAL-000001";
  }
  const lastNumber = Number(lastSale.saleNumber.replace("SAL-", ""));
  return `SAL-${String(lastNumber + 1).padStart(6, "0")}`;
}
