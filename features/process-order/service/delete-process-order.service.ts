import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { NotFoundError } from "@/lib/errors";
import { processOrders } from "../schemas/process-orders.schema";

export const deleteProcessOrder = async (
  companyId: string,
  processOrderId: string,
) => {
  const [deletedProcessOrder] = await db
    .delete(processOrders)
    .where(
      and(
        eq(processOrders.id, processOrderId),
        eq(processOrders.companyId, companyId),
      ),
    )
    .returning({
      id: processOrders.id,
    });

  if (!deletedProcessOrder) {
    throw new NotFoundError("Process order not found.");
  }
};
