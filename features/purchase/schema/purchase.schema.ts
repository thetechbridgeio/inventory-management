import { z } from "zod"

export const purchaseSchema = z.object({
  product: z.string().trim().min(1, "Product is required"),

  quantity: z
    .number("Quantity must be a number")
    .positive("Quantity must be greater than 0"),

  unit: z.string().trim().min(1, "Unit is required"),

  poNumber: z.string().trim().min(1, "PO Number is required"),

  supplier: z.string().trim().min(1, "Supplier is required"),

  dateOfReceiving: z.string().trim().min(1, "Date of receiving is required"),

  rackNumber: z.string().trim().min(1, "Rack number is required"),

  timestamp: z.string().optional(),
})

export type PurchaseSchema = z.infer<typeof purchaseSchema>
