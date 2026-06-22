import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema";

import { SupplierDetails } from "../types/suppliers.type";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function getSupplierById(
  supplierId: string,
  companyId: string,
): Promise<SupplierDetails> {
  try {
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
      throw new NotFoundError("Supplier not found");
    }

    const { products, ...supplierData } = supplier;

    return {
      ...supplierData,
      products: products.map(({ product }) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        minOrderQty: product.minOrderQty,
        maxOrderQty: product.maxOrderQty,
        reorderQty: product.reorderQty,
      })),
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}