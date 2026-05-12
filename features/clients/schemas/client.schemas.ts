import { z } from "zod"

export const createClientSchema = z.object({
  sheetId: z.string().min(1, "Sheet ID is required"),

  // Company Information
  companyName: z.string().min(2, "Company name is required"),
  gstNumber: z.string().min(5, "GST number is required"),
  address: z.string().min(5, "Address is required"),
  description: z.string().optional(),

  // Branding ✅ .or(literal) before .optional()
  logoUrl: z.string().url("Invalid logo URL").or(z.literal("")).optional(),
  website: z.string().url("Invalid website URL").or(z.literal("")).optional(),

  // Primary Contact
  contactPersonName: z.string().min(2, "Contact person name is required"),
  contactPersonEmail: z.string().email("Invalid contact person email"),
  contactPersonPhone: z.string().min(5, "Contact person phone is required"),

  // Super Admin
  superAdminName: z.string().min(2, "Super admin name is required"),
  superAdminEmail: z.string().email("Invalid super admin email"),
  superAdminPhoneNumber: z.string().min(5, "Super admin phone is required"),

  // Authentication
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),

  // Status
  isActive: z.boolean(),
})

export const clientSchema = createClientSchema.extend({
  id: z.string().min(1, "Client ID is required"),
  createdAt: z.string().min(1, "Created date is required"),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type Client = z.infer<typeof clientSchema>
