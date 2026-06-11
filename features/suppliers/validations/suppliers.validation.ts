import z from "zod";

export const supplierSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPersonName: z.string().nullable().optional(),
  email: z.email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  gst: z.string().nullable().optional(),
  estimatedDeliveryPeriod: z.string().nullable().optional(),
  paymentTerm: z.string().nullable().optional()
});
