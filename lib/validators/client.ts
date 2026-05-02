import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  sheetId: z.string().min(10, "Invalid Sheet ID"),
  username: z.string().min(3),
  password: z.string().min(6),
  superAdminEmail: z.string().email("Invalid super admin email"),
})

export type ClientFormData = z.infer<typeof clientSchema>