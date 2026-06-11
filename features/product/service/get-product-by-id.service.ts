import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { ProductDetails } from "../types/product-details";

export async function getProductById(
  productId: string,
  companyId: string,
): Promise<ProductDetails | null> {
  const product = await db.query.products.findFirst({
    where: (products, { and, eq }) =>
      and(eq(products.id, productId), eq(products.companyId, companyId)),

    with: {
      suppliers: {
        with: {
          supplier: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    companyId: product.companyId,

    name: product.name,
    description: product.description,

    category: product.category,
    unit: product.unit,

    minOrderQty: product.minOrderQty,
    maxOrderQty: product.maxOrderQty,
    reorderQty: product.reorderQty,

    openingStock: product.openingStock,
    currentStock: product.currentStock,

    location: product.location,

    createdAt: product.createdAt,
    updatedAt: product.updatedAt,

    suppliers: product.suppliers.map((ps) => ({
      id: ps.supplier.id,
      companyName: ps.supplier.companyName,
      contactPersonName: ps.supplier.contactPersonName,
      email: ps.supplier.email,
      phone: ps.supplier.phone,
      estimatedDeliveryPeriod: ps.supplier.estimatedDeliveryPeriod,
      paymentTerm: ps.supplier.paymentTerm,
      isActive: ps.supplier.isActive,
    })),
  };
}
