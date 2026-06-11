import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/features/product/schemas/product.schema";
import { generateSaleNumber } from "./generate-sale-number.service";
import {
  CreateSaleFormType,
  CreateSaleType,
  SaleItemType,
} from "../types/sales.type";
import { sales } from "../schemas/sales.schema";
import { saleItems } from "../schemas/sales-item.schema";

export async function createSale(
  data: CreateSaleFormType,
  companyId: string,
  userId: string,
) {
  return db.transaction(async (tx) => {
    const saleNumber = await generateSaleNumber(tx, companyId);

    const grandTotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.sellingPrice,
      0,
    );

    const saleData: CreateSaleType = {
      companyId,
      saleNumber,
      grandTotal: grandTotal.toFixed(2),
      saleDate: data.saleDate,
      remarks: data.remarks?.trim() || null,
      createdBy: userId,
    };

    const [sale] = await tx.insert(sales).values(saleData).returning();

    const saleItemValues: SaleItemType[] = data.items.map((item) => ({
      saleId: sale.id,
      productId: item.productId,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice.toFixed(2),
      lineTotal: (item.quantity * item.sellingPrice).toFixed(2),
    }));

    await tx.insert(saleItems).values(saleItemValues);

    for (const item of data.items) {
      await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }
    return sale;
  });
}
