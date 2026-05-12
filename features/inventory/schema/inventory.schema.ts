import { z } from "zod"

export const inventorySchema = z.object({
  product: z.string().trim().min(1, "Product is required"),

  category: z.string().trim().min(1, "Category is required"),

  unit: z.string().trim().min(1, "Unit is required"),

  minimumQuantity: z.number().min(0),

  maximumQuantity: z.number().min(0),

  reorderQuantity: z.number().min(0),

  stock: z.number().min(0),

  pricePerUnit: z.number().min(0),

  value: z.number().min(0),

  timestamp: z.string().optional(),

  location: z.string().optional(),

  productType: z.enum(["Raw", "Finished"]),

  openingStock: z.number().optional(),
})

export type InventorySchema = z.infer<typeof inventorySchema>
