import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/features/product/schemas/product.schema";
import { purchaseItems } from "../schemas/purchase-item.schema";
import { purchases } from "../schemas/purchase.schema";

import {
  CreatePurchaseFormType,
  CreatePurchaseType,
  PurchaseItemType,
} from "../types/purchase.type";
import { generatePurchaseNumber } from "./generate-purchase-number.service";

export async function createPurchase(
  data: CreatePurchaseFormType,
  companyId: string,
  userId: string,
) {
  return db.transaction(async (tx) => {
    const purchaseNumber = await generatePurchaseNumber(tx, companyId);

    const grandTotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.purchasePrice,
      0,
    );

    const purchaseData: CreatePurchaseType = {
      companyId,
      supplierId: data.supplierId,
      purchaseNumber,
      grandTotal: grandTotal.toFixed(2),
      purchaseDate: data.purchaseDate,
      remarks: data.remarks?.trim() || null,
      createdBy: userId,
    };

    const [purchase] = await tx
      .insert(purchases)
      .values(purchaseData)
      .returning();

    const purchaseItemValues: PurchaseItemType[] = data.items.map((item) => ({
      purchaseId: purchase.id,
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice.toFixed(2),
      lineTotal: (item.quantity * item.purchasePrice).toFixed(2),
    }));

    await tx.insert(purchaseItems).values(purchaseItemValues);

    for (const item of data.items) {
      await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} + ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }
    return purchase;
  });
}
