import { z } from "zod";
import { PRODUCT_CATEGORIES } from "../constants/product-category";
import { requiredNumber } from "@/lib/require-number";

export const CreateProductFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .max(255, "Product name is too long"),
    description: z
      .string()
      .trim()
      .max(1000, "Description is too long")
      .optional(),
    category: z.string().min(1, "Category is required"),
    unit: z
      .string()
      .trim()
      .min(1, "Unit is required")
      .max(50, "Unit is too long"),
    minOrderQty: requiredNumber("Minimum order quantity"),
    maxOrderQty: requiredNumber("Maximum order quantity"),
    reorderQty: requiredNumber("Reorder quantity"),
    openingStock: requiredNumber("Opening stock"),
    location: z.string().trim().max(255, "Location is too long").optional(),
    supplierIds: z
      .array(z.string().uuid())
      .min(1, "At least one supplier is required"),
  })
  .refine((data) => data.maxOrderQty >= data.minOrderQty, {
    path: ["maxOrderQty"],
    message:
      "Maximum order quantity must be greater than or equal to minimum order quantity",
  });
