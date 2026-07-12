import { db } from "@/db";
import { processOrders } from "../schemas/process-orders.schema";
import { processOrderItems } from "../schemas/process-order-item.schema";
import { eq, sql } from "drizzle-orm";
import {
  GetProcessOrdersParams,
  ProcessOrderList,
} from "../types/process-order.types";
import { buildProcessOrderWhereClause } from "./build-process-order-where-clause";
import { PaginatedResponse } from "@/lib/common-types";

export const getProcessOrders = async (
  companyId: string,
  params: GetProcessOrdersParams,
): Promise<PaginatedResponse<ProcessOrderList>> => {
  const { page, pageSize, search, fromDate, toDate } = params;

  const where = buildProcessOrderWhereClause(companyId, {
    page,
    search,
    fromDate,
    toDate,
  });

  const data = await db
    .select({
      id: processOrders.id,
      processOrderNo: processOrders.processOrderNo,
      status: processOrders.status,
      vendorName: processOrders.vendorName,
      remarks: processOrders.remarks,
      createdAt: processOrders.createdAt,

      itemCount: sql<number>`count(${processOrderItems.id})`,
      totalSentQty: sql<number>`coalesce(sum(${processOrderItems.sentQty}), 0)`,
      totalReceivedQty: sql<number>`coalesce(sum(${processOrderItems.receivedQty}), 0)`,
      totalProcessingCost: sql<number>`
        coalesce(sum(${processOrderItems.processingCost}), 0)
      `,
      lastSentDate: sql<Date | null>`max(${processOrderItems.sentDate})`,
      lastReceivedDate: sql<Date | null>`max(${processOrderItems.receivedDate})`,
    })
    .from(processOrders)
    .leftJoin(
      processOrderItems,
      eq(processOrders.id, processOrderItems.processOrderId),
    )
    .where(where)
    .groupBy(processOrders.id)
    .orderBy(sql`${processOrders.createdAt} DESC`)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ total }] = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(processOrders)
    .where(where);

  return {
    data,
    page,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
};