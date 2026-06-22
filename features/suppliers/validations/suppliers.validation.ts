import z from "zod";

export const CreateSupplierFormSchema = z.object({
  companyName: z
    .string("Company name is required")
    .trim()
    .min(1, "Company name is required")
    .max(255, "Company name cannot exceed 255 characters"),
  contactPersonName: z
    .string()
    .trim()
    .max(255, "Contact person name cannot exceed 255 characters")
    .optional(),
  email: z.email("Please enter a valid email address").optional(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Please enter a valid Indian mobile number")
    .optional(),
  address: z
    .string()
    .trim()
    .max(1000, "Address cannot exceed 1000 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  gst: z
    .string()
    .trim()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Please enter a valid GST number",
    )
    .optional(),
  estimatedDeliveryPeriod: z
    .number({
      message: "Estimated delivery period must be a valid number",
    })
    .int("Estimated delivery period must be a whole number")
    .min(0, "Estimated delivery period cannot be negative")
    .optional(),
  paymentTerm: z
    .string()
    .trim()
    .max(255, "Payment term cannot exceed 255 characters")
    .optional(),
});

export const UpdateSupplierFormSchema = CreateSupplierFormSchema;

export const CreateSupplierDTOSchema = z.object({
  companyId: z.uuid("Invalid company ID"),

  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(255, "Company name cannot exceed 255 characters"),
  contactPersonName: z
    .string()
    .trim()
    .max(255, "Contact person name cannot exceed 255 characters")
    .nullable(),
  email: z.email("Please enter a valid email address").nullable(),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Please enter a valid Indian mobile number")
    .nullable(),
  address: z
    .string()
    .trim()
    .max(1000, "Address cannot exceed 1000 characters")
    .nullable(),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable(),
  gst: z
    .string()
    .trim()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
      "Please enter a valid GST number",
    )
    .nullable(),
  estimatedDeliveryPeriod: z
    .number({
      message: "Estimated delivery period must be a valid number",
    })
    .int("Estimated delivery period must be a whole number")
    .min(0, "Estimated delivery period cannot be negative")
    .nullable(),
  paymentTerm: z
    .string()
    .trim()
    .max(255, "Payment term cannot exceed 255 characters")
    .nullable(),
});

export const UpdateSupplierDTOSchema = CreateSupplierDTOSchema;
