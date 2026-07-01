import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { purchaseRequests } from "../schemas/purchase-request.schema";

type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

export async function generatePurchaseRequestNumber(tx: Tx, companyId: string) {
  const lastPurchaseRequest = await tx.query.purchaseRequests.findFirst({
    where: eq(purchaseRequests.companyId, companyId),
    columns: {
      purchaseRequestNumber: true,
    },
    orderBy: desc(purchaseRequests.purchaseRequestNumber),
  });

  if (!lastPurchaseRequest) {
    return "PR-000001";
  }

  const lastNumber = Number(
    lastPurchaseRequest.purchaseRequestNumber.replace("PR-", ""),
  );

  return `PR-${String(lastNumber + 1).padStart(6, "0")}`;
}
