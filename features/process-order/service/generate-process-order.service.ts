import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { processOrders } from "../schemas/process-orders.schema";

type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<any>
  ? T
  : never;

export async function generateProcessOrderNumber(tx: Tx, companyId: string) {
  const lastProcessOrder = await tx.query.processOrders.findFirst({
    where: eq(processOrders.companyId, companyId),
    columns: {
      processOrderNo: true,
    },
    orderBy: desc(processOrders.processOrderNo),
  });
  if (!lastProcessOrder) {
    return "PRO-000001";
  }
  const lastNumber = Number(
    lastProcessOrder.processOrderNo.replace("PRO-", ""),
  );
  return `PRO-${String(lastNumber + 1).padStart(6, "0")}`;
}
