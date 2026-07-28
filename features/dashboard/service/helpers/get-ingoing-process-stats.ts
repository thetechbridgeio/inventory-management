import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { processOrderItems, processOrders } from "@/db/schema";
import { PROCESS_ORDER_ITEM_STATUS } from "@/features/process-order/constants/process-order-item-status";


export interface IngoingProcessStats {
  activeItemCount: number;
  activeUnitCount: number;
}

export const getIngoingProcessStats = async (
  companyId: string,
): Promise<IngoingProcessStats> => {
  const [result] = await db
    .select({
      activeItemCount: count(),
      activeUnitCount:
        sql<number>`COALESCE(SUM(${processOrderItems.sentQty}), 0)`,
    })
    .from(processOrderItems)
    .innerJoin(
      processOrders,
      eq(processOrderItems.processOrderId, processOrders.id),
    )
    .where(
      and(
        eq(processOrders.companyId, companyId),
        eq(
          processOrderItems.status,
          PROCESS_ORDER_ITEM_STATUS.SENT,
        ),
      ),
    );

  return {
    activeItemCount: Number(result.activeItemCount),
    activeUnitCount: Number(result.activeUnitCount),
  };
};