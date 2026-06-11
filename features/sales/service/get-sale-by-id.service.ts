import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "../schemas/sales.schema";

export async function getSaleById(saleId: string, companyId: string) {
  const sale = await db.query.sales.findFirst({
    where: and(eq(sales.id, saleId), eq(sales.companyId, companyId)),

    columns: {
      id: true,
      saleNumber: true,
      saleDate: true,
      remarks: true,
      grandTotal: true,
      createdAt: true,
    },

    with: {
      items: {
        columns: {
          id: true,
          quantity: true,
          sellingPrice: true,
          lineTotal: true,
        },

        with: {
          product: {
            columns: {
              id: true,
              name: true,
              unit: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!sale) {
    throw new Error("Sale not found");
  }

  return {
    id: sale.id,
    saleNumber: sale.saleNumber,
    saleDate: sale.saleDate,
    remarks: sale.remarks,
    grandTotal: sale.grandTotal,
    createdAt: sale.createdAt,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      unit: item.product.unit,
      category: item.product.category,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      lineTotal: item.lineTotal,
    })),
  };
}
