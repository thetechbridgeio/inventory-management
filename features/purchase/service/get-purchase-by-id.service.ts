import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "../schemas/purchase.schema";

export async function getPurchaseById(purchaseId: string, companyId: string) {
  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.id, purchaseId),
      eq(purchases.companyId, companyId),
    ),

    columns: {
      id: true,
      purchaseNumber: true,
      purchaseDate: true,
      supplierId: true,
      remarks: true,
      image: true,
      grandTotal: true,
      createdAt: true,
    },

    with: {
      supplier: {
        columns: {
          companyName: true,
        },
      },

      items: {
        columns: {
          id: true,
          quantity: true,
          purchasePrice: true,
          lineTotal: true,
        },

        with: {
          product: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  return {
    id: purchase.id,
    purchaseNumber: purchase.purchaseNumber,
    purchaseDate: purchase.purchaseDate,
    supplierId: purchase.supplierId,
    supplierName: purchase.supplier.companyName,
    remarks: purchase.remarks,
    image: purchase.image,
    grandTotal: purchase.grandTotal,
    createdAt: purchase.createdAt,
    items: purchase.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
      lineTotal: item.lineTotal,
    })),
  };
}
