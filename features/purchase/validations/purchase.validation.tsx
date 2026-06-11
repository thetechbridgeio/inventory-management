import { z } from "zod";

export const PurchaseItemSchema = z.object({
  productId: z.uuid("Product is required"),
  quantity: z.coerce
    .number({
      error: "Quantity is required",
    })
    .int()
    .min(1, "Quantity must be at least 1"),
  purchasePrice: z.coerce
    .number({
      error: "Purchase price is required",
    })
    .positive("Purchase price must be greater than 0"),
});

export const CreatePurchaseFormSchema = z
  .object({
    supplierId: z.uuid("Supplier is required"),
    purchaseDate: z.string().min(1, "Purchase date is required"),
    remarks: z.string().trim().max(1000, "Remarks is too long").optional(),
    items: z.array(PurchaseItemSchema).min(1, "At least one item is required"),
  })
  .refine(
    (data) => {
      const productIds = data.items.map((item) => item.productId);

      return new Set(productIds).size === productIds.length;
    },
    {
      path: ["items"],
      message: "Duplicate products are not allowed",
    },
  );
