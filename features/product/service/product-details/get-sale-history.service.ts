import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { saleItems, sales } from "@/db/schema";

export async function getProductSaleHistory(
  productId: string,
  companyId: string,
) {
  return db
    .select({
      saleQty: saleItems.quantity,
      sellingPrice: saleItems.sellingPrice,
      saleNumber: sales.saleNumber,
      soldTo: sales.soldTo,
      saleDate: sales.saleDate,
      workOrderNumber: sales.workOrderNumber,
      challanNumber: sales.challanNumber,
      invoiceNumber: sales.invoiceNumber,
    })
    .from(saleItems)
    .innerJoin(
      sales,
      eq(saleItems.saleId, sales.id),
    )
    .where(
      and(
        eq(saleItems.productId, productId),
        eq(sales.companyId, companyId),
      ),
    )
    .orderBy(desc(sales.saleDate));
}