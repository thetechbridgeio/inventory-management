import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { saleReturns } from "../schemas/sale-return.schema";

export type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

export async function generateReturnNumber(tx: Tx, companyId: string) {
  const lastReturn = await tx.query.saleReturns.findFirst({
    where: eq(saleReturns.companyId, companyId),

    columns: {
      returnNumber: true,
    },
    orderBy: desc(saleReturns.returnNumber),
  });

  if (!lastReturn) {
    return "RET-000001";
  }

  const lastNumber = Number(lastReturn.returnNumber.replace("RET-", ""));
  return `RET-${String(lastNumber + 1).padStart(6, "0")}`;
}
