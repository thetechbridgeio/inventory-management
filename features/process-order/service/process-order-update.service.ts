import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";

import { PROCESS_ORDER_ITEM_STATUS } from "../constants/process-order-item-status";
import { PROCESS_ORDER_STATUS } from "../constants/process-order-status";
import { processOrderItems } from "../schemas/process-order-item.schema";
import { processOrders } from "../schemas/process-orders.schema";
import { ProcessOrderUpdatePayload } from "../types/process-order.types";
import { products } from "@/db/schema";
import { ValidationError } from "@/lib/errors";

export const updateProcessOrder = async (
  companyId: string,
  processOrderId: string,
  payload: ProcessOrderUpdatePayload,
) => {
  const { items } = payload;

  const processOrderStatus = items.every(
    ({ status }) => status === PROCESS_ORDER_ITEM_STATUS.RECEIVED,
  )
    ? PROCESS_ORDER_STATUS.RECEIVED
    : items.every(
          ({ status }) => status === PROCESS_ORDER_ITEM_STATUS.CANCELLED,
        )
      ? PROCESS_ORDER_STATUS.CANCELLED
      : PROCESS_ORDER_STATUS.PARTIALLY_RECEIVED;

  await db.transaction(async (tx) => {
    // Fetch all existing items once
    const existingItems = await tx.query.processOrderItems.findMany({
      where: and(
        eq(processOrderItems.processOrderId, processOrderId),
        inArray(
          processOrderItems.id,
          items.map(({ id }) => id),
        ),
      ),
      columns: {
        id: true,
        sentQty: true,
        sentProductId: true,
        receivedProductId: true,
      },
    });

    if (existingItems.length !== items.length) {
      throw new Error("One or more process order items were not found.");
    }

    const existingItemMap = new Map(
      existingItems.map((item) => [item.id, item]),
    );

    // Update Process Order
    await tx
      .update(processOrders)
      .set({
        status: processOrderStatus,
      })
      .where(
        and(
          eq(processOrders.id, processOrderId),
          eq(processOrders.companyId, companyId),
        ),
      );

    for (const item of items) {
      const existingItem = existingItemMap.get(item.id)!;

      const receivedQty =
        item.status === PROCESS_ORDER_ITEM_STATUS.CANCELLED
          ? 0
          : item.receivedQty;

      if (item.receivedQty > existingItem.sentQty) {
        throw new ValidationError(
          "Received quantity cannot be greater than sent quantity.",
        );
      }

      // Update Process Order Item
      await tx
        .update(processOrderItems)
        .set({
          receivedQty,
          processingCost: item.processingCost,
          receivedDate: item.receivedDate ? new Date(item.receivedDate): undefined,
          status: item.status,
          location: item.location,
        })
        .where(eq(processOrderItems.id, item.id));

      if (item.status === PROCESS_ORDER_ITEM_STATUS.RECEIVED) {
        // Increase received product stock
        await tx
          .update(products)
          .set({
            currentStock: sql`${products.currentStock} + ${receivedQty}`,
          })
          .where(eq(products.id, existingItem.receivedProductId));

        // Return unused sent stock
        const remainingQty = existingItem.sentQty - receivedQty;

        if (remainingQty > 0) {
          await tx
            .update(products)
            .set({
              currentStock: sql`${products.currentStock} + ${remainingQty}`,
            })
            .where(eq(products.id, existingItem.sentProductId));
        }
      } else {
        // Cancelled -> restore all sent stock
        await tx
          .update(products)
          .set({
            currentStock: sql`${products.currentStock} + ${existingItem.sentQty}`,
          })
          .where(eq(products.id, existingItem.sentProductId));
      }
    }
  });
};
