import z, { positive } from "zod";

export const PurchaseRequestSchema = z.object({
  remarks: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      supplierId: z.string(),
      supplierName: z.string().optional(),
       requestedQty: z
        .number({
          error: "Requested quantity is required",
        })
        .gt(0, "Requested quantity must be greater than 0")
        .max(999999, "Enter a realistic order quantity"),
    }),
  ),
});

export type PurchaseRequestForm = z.infer<typeof PurchaseRequestSchema>;
