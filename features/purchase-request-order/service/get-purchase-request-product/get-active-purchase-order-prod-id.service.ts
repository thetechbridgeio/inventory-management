import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
// import {
//   purchaseOrderItems,
//   purchaseOrders,
// } from "@/db/schema";

// import {
//   ACTIVE_PURCHASE_ORDER_STATUSES,
// } from "../constants/purchase-order-status";

/**
 * Returns product ids that are already part of an active Purchase Order.
 */
// async function getActivePurchaseOrderProductIds(
//   companyId: string,
// ): Promise<string[]> {
//   const rows = await db
//     .select({
//       productId: purchaseOrderItems.productId,
//     })
//     .from(purchaseOrderItems)
//     .innerJoin(
//       purchaseOrders,
//       eq(
//         purchaseOrderItems.purchaseOrderId,
//         purchaseOrders.id,
//       ),
//     )
//     .where(
//       and(
//         eq(purchaseOrders.companyId, companyId),
//         inArray(
//           purchaseOrders.status,
//           ACTIVE_PURCHASE_ORDER_STATUSES,
//         ),
//       ),
//     );

//   return [...new Set(rows.map((row) => row.productId))];
// }