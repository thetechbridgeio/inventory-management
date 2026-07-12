import { db } from "@/db";
import { processOrders } from "../schemas/process-orders.schema";
import { processOrderItems } from "../schemas/process-order-item.schema";

import { and, eq } from "drizzle-orm";

import { ProcessOrderDetail } from "../types/process-order.types";
import { products } from "@/features/product/schemas/product.schema";
import { alias } from "drizzle-orm/pg-core";

const sentProducts = alias(products, "sentProducts");
const receivedProducts = alias(products, "receivedProducts");

export const getProcessOrderById = async (
  companyId: string,
  processOrderId: string,
): Promise<ProcessOrderDetail | null> => {
  const [processOrder] = await db
    .select({
      id: processOrders.id,
      processOrderNo: processOrders.processOrderNo,
      status: processOrders.status,
      vendorName: processOrders.vendorName,
      remarks: processOrders.remarks,
      createdAt: processOrders.createdAt,
    })
    .from(processOrders)
    .where(
      and(
        eq(processOrders.id, processOrderId),
        eq(processOrders.companyId, companyId),
      ),
    );

  if (!processOrder) {
    return null;
  }

  const items = await db
    .select({
      id: processOrderItems.id,
      processOrderId: processOrderItems.processOrderId,

      sentProduct: {
        id: sentProducts.id,
        name: sentProducts.name,
        description: sentProducts.description,
        category: sentProducts.category,
        unit: sentProducts.unit,
      },

      receivedProduct: {
        id: receivedProducts.id,
        name: receivedProducts.name,
        description: receivedProducts.description,
        category: receivedProducts.category,
        unit: receivedProducts.unit,
      },

      sentQty: processOrderItems.sentQty,
      receivedQty: processOrderItems.receivedQty,
      sentDate: processOrderItems.sentDate,
      receivedDate: processOrderItems.receivedDate,
      processingCost: processOrderItems.processingCost,
      location: processOrderItems.location,
      status: processOrderItems.status,
    })
    .from(processOrderItems)
    .innerJoin(
      sentProducts,
      eq(processOrderItems.sentProductId, sentProducts.id),
    )
    .innerJoin(
      receivedProducts,
      eq(processOrderItems.receivedProductId, receivedProducts.id),
    )
    .where(eq(processOrderItems.processOrderId, processOrderId));

  return {
    ...processOrder,
    items,
  };
};
