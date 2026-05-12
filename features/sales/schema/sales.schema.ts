import { z } from "zod"

export const salesSchema = z.object({
  product: z.string().trim().min(1, "Product is required"),

  quantity: z
    .number("Quantity must be a number")
    .positive("Quantity must be greater than 0"),

  unit: z.string().trim().min(1, "Unit is required"),

  contact: z.string().trim().min(1, "Contact is required"),

  companyName: z.string().trim().min(1, "Company name is required"),

  dateOfIssue: z.string().trim().min(1, "Date of issue is required"),

  timestamp: z.string().optional(),
})

export type SalesSchema = z.infer<typeof salesSchema>
