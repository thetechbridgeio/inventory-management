// features/suppliers/schemas/supplier.schema.ts

import { z } from "zod"

export const SupplierSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),

  description: z.string().min(2, "Description is required"),

  address: z.string().min(5, "Address is required"),

  phoneNumber: z.string().min(5, "Phone number is required"),

  emailId: z.string().email("Invalid email"),

  gstNumber: z.string().min(5, "GST number is required"),

  paymentTerms: z.string().min(1, "Payment terms required"),

  estimatedDeliveryPeriod: z.string().min(1, "Delivery period required"),

  sentAutomatedOrder: z.boolean(),
})
