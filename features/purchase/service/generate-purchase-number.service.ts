import "server-only";

import { desc, eq } from "drizzle-orm";

import { purchases } from "../schemas/purchase.schema";
import { db } from "@/db";

type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

export async function generatePurchaseNumber(tx: Tx, companyId: string) {
  const lastPurchase = await tx.query.purchases.findFirst({
    where: eq(purchases.companyId, companyId),

    columns: {
      purchaseNumber: true,
    },
    orderBy: desc(purchases.purchaseNumber),
  });

  if (!lastPurchase) {
    return "PUR-000001";
  }
  const lastNumber = Number(lastPurchase.purchaseNumber.replace("PUR-", ""));
  return `PUR-${String(lastNumber + 1).padStart(6, "0")}`;
}
