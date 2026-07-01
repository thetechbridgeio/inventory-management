import z from "zod";

export const PurchaseRequestApprovalItemSchema = z.object({
  purchaseRequestItemId: z.uuid(),
  approvedQty: z.number().min(0),
  supplierId: z.uuid().nullable(),
  supplierName: z.string().nullable(),
});

export const PurchaseRequestApprovalFormSchema = z.object({
  purchaseRequestItems: z.array(PurchaseRequestApprovalItemSchema),
});
