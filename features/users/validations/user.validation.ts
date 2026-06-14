import { ROLES } from "@/features/auth/constants/user-role";
import { z } from "zod";

export const onboardingUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),

    email: z.email("Invalid email address"),

    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => {
        if (!value) return undefined;

        const phone = value.replace(/\s+/g, "");

        return phone.startsWith("+91") ? phone : `+91${phone}`;
      })
      .refine(
        (value) => {
          if (!value) return true;

          return /^\+91\d{10}$/.test(value);
        },
        {
          message: "Phone number must be a valid Indian number",
        }
      ),

    role: z.enum(ROLES),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });