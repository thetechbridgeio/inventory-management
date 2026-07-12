import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { productSuppliers, suppliers } from "@/db/schema";

export async function getProductSuppliers(
  productId: string,
  companyId: string,
) {
  return db
    .select({
      id: suppliers.id,
      companyName: suppliers.companyName,
      contactPersonName: suppliers.contactPersonName,
      email: suppliers.email,
      phone: suppliers.phone,
      estimatedDeliveryPeriod: suppliers.estimatedDeliveryPeriod,
      paymentTerm: suppliers.paymentTerm,
      isActive: suppliers.isActive,
    })
    .from(productSuppliers)
    .innerJoin(suppliers, eq(productSuppliers.supplierId, suppliers.id))
    .where(
      and(
        eq(productSuppliers.productId, productId),
        eq(productSuppliers.companyId, companyId),
        eq(suppliers.companyId, companyId),
        eq(suppliers.isActive, true),
      ),
    );
}
