import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { NotFoundError } from "@/lib/errors/not-found-error";

import { saleReturns } from "../schemas/sale-return.schema";

export async function getSaleReturnById(returnId: string, companyId: string) {
  const saleReturn = await db.query.saleReturns.findFirst({
    where: and(
      eq(saleReturns.id, returnId),
      eq(saleReturns.companyId, companyId),
    ),

    columns: {
      id: true,
      returnNumber: true,
      returnDate: true,
      reason: true,
      status: true,
      totalItems: true,
      totalReturnedQty: true,
      rejectionReason: true,
      approvedAt: true,
      createdAt: true,
    },

    with: {
      sale: {
        columns: {
          id: true,
          saleNumber: true,
          soldTo: true,
        },
      },

      createdByUser: {
        columns: {
          id: true,
          name: true,
        },
      },

      approvedByUser: {
        columns: {
          id: true,
          name: true,
        },
      },

      items: {
        columns: {
          id: true,
          quantity: true,
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

  if (!saleReturn) {
    throw new NotFoundError("Return request not found");
  }

  return {
    id: saleReturn.id,
    returnNumber: saleReturn.returnNumber,
    returnDate: saleReturn.returnDate,
    reason: saleReturn.reason,
    status: saleReturn.status,
    totalItems: saleReturn.totalItems,
    totalReturnedQty: saleReturn.totalReturnedQty,
    rejectionReason: saleReturn.rejectionReason,
    approvedAt: saleReturn.approvedAt,
    createdAt: saleReturn.createdAt,
    sale: saleReturn.sale,
    createdByUser: saleReturn.createdByUser,
    approvedByUser: saleReturn.approvedByUser,
    items: saleReturn.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      unit: item.product.unit,
      category: item.product.category,
      quantity: item.quantity,
    })),
  };
}
