import { z } from "zod";

import { PURCHASE_REQUEST_STATUS } from "../constants/purchase-request-status";
import { PURCHASE_REQUEST_ITEM_STATUS } from "../constants/purchase-request-item-status";

export const PurchaseRequestSchema = z.object({
  purchaseRequestNumber: z.string().trim().min(1),
  status: z
    .enum(Object.values(PURCHASE_REQUEST_STATUS) as [string, ...string[]])
    .default(PURCHASE_REQUEST_STATUS.PENDING_APPROVAL),
  remarks: z.string().trim().optional().nullable(),
  totalItems: z.coerce.number().int().min(1),
  totalRequestedQty: z.coerce.number().int().min(1),
});

export const PurchaseRequestItemSchema = z.object({
  productId: z.uuid(),
  requestedQty: z.coerce.number().int().positive(),
  approvedQty: z.coerce.number().int().nullable(),
  status: z
    .enum(Object.values(PURCHASE_REQUEST_ITEM_STATUS) as [string, ...string[]])
    .default(PURCHASE_REQUEST_ITEM_STATUS.PENDING_APPROVAL),
  supplierId: z.uuid().nullable().optional(),
});

export const PurchaseRequestFormSchema = z
  .object({
    remarks: z.string().optional().nullable(),
    items: z
      .array(
        z.object({
          productId: z.uuid(),
          requestedQty: z.number().nonnegative().gt(0),
          supplierId: z.uuid().optional().nullable(),
          supplierName: z.string().optional().nullable()
        }),
      )
      .min(1, "At least one product is required"),
  })
  .superRefine(({ items }, ctx) => {
    const seen = new Set<string>();

    items.forEach((item, index) => {
      if (seen.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "Product must be unique.",
        });
      }

      seen.add(item.productId);
    });
  });
