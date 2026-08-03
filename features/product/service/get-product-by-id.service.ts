import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import { ProductDetails } from "../types/product.types";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getProductById(
  productId: string,
  companyId: string,
): Promise<ProductDetails> {
  try {
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
      throw new NotFoundError("Product not found");
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
      unitCost: product.unitCost,
      location: product.location,
      stockMovement: product.stockMovement,
      image: product.image,
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
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
