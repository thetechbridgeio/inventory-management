import z from "zod";

export const PurchaseRequestSchema = z.object({
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      supplierId: z.string(),
      supplierName: z.string().optional(),
      requestedQty: z
        .number("requested order qty is required to make PO")
        .min(0, "min value should be greater than")
        .max(999999, "Enter a realistic order qty"),
    }),
  ),
});

export type PurchaseRequestForm = z.infer<typeof PurchaseRequestSchema>;
