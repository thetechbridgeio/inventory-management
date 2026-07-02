import z from "zod";

export const PurchaseRequestDecisionSchema = z.enum([
  "APPROVE",
  "REJECT",
  "ACTION_REQUIRED",
]);

export const PurchaseRequestApprovalItemSchema = z.object({
  purchaseRequestItemId: z.uuid(),
  decision: PurchaseRequestDecisionSchema,

  approvedQty: z.number().min(0),

  supplierId: z.uuid().nullable(),
  supplierName: z.string().nullable(),
});

export const PurchaseRequestApprovalFormSchema = z.object({
  purchaseRequestItems: z.array(PurchaseRequestApprovalItemSchema),
});

export type PurchaseRequestDecision = z.infer<
  typeof PurchaseRequestDecisionSchema
>;