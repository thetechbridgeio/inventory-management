import { db } from "@/db";
import { PurchaseOrderStatus } from "../../constants/purchase-order-status";
import { purchaseOrders } from "../../schemas/purchase-order.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { eq } from "drizzle-orm";

export async function updatePurchaseOrderStatus(
  purchaseOrderId: string,
  status: PurchaseOrderStatus,
): Promise<void> {
  try {
    const [updatedPurchaseOrder] = await db
      .update(purchaseOrders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(purchaseOrders.id, purchaseOrderId))
      .returning({
        id: purchaseOrders.id,
      });

    if (!updatedPurchaseOrder) {
      throw new Error("Purchase Order not found.");
    }
  } catch (error) {
    throw mapDatabaseError(error);
  }
}