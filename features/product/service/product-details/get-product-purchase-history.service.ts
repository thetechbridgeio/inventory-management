import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { purchaseItems, purchases, suppliers } from "@/db/schema";

export async function getProductPurchaseHistory(
  productId: string,
  companyId: string,
) {
  return db
    .select({
      purchaseQty: purchaseItems.quantity,
      purchasePrice: purchaseItems.purchasePrice,
      purchaseNumber: purchases.purchaseNumber,
      purchaseDate: purchases.purchaseDate,
      challanNumber: purchases.challanNumber,
      invoiceNumber: purchases.invoiceNumber,
      supplier: {
        id: suppliers.id,
        supplierName: suppliers.companyName,
      },
    })
    .from(purchaseItems)
    .innerJoin(purchases, eq(purchaseItems.purchaseId, purchases.id))
    .innerJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .where(
      and(
        eq(purchaseItems.productId, productId),
        eq(purchases.companyId, companyId),
      ),
    )
    .orderBy(desc(purchases.purchaseDate));
}
