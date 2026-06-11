import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { SupplierDetails } from "../types/supplier-details";

export async function getSupplierById(
  supplierId: string,
  companyId: string,
): Promise<SupplierDetails | null> {
  const supplier = await db.query.suppliers.findFirst({
    where: and(
      eq(suppliers.id, supplierId),
      eq(suppliers.companyId, companyId),
    ),

    with: {
      products: {
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              description: true,
              minOrderQty: true,
              maxOrderQty: true,
              reorderQty: true,
            },
          },
        },
      },
    },
  });

  if (!supplier) {
    return null;
  }

  return {
    id: supplier.id,
    companyId: supplier.companyId,
    companyName: supplier.companyName,
    contactPersonName: supplier.contactPersonName,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    gst: supplier.gst,
    estimatedDeliveryPeriod:
      supplier.estimatedDeliveryPeriod,
    paymentTerm: supplier.paymentTerm,
    isActive: supplier.isActive,
    createdAt: supplier.createdAt,
    updatedAt: supplier.updatedAt,

    products: supplier.products.map(({ product }) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      minOrderQty: product.minOrderQty,
      maxOrderQty: product.maxOrderQty,
      reorderQty: product.reorderQty,
    })),
  };
}