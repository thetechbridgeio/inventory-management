import { ROLES } from "@/features/auth/constants/user-role";
import { onboardingUserSchema } from "@/features/users/validations/user.validation";
import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  gst: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional().or(z.literal("")),
  website: z.string().nullable().optional().or(z.literal("")),
  contactPersonName: z.string().nullable().optional(),

  contactPersonEmail: z.string().nullable().optional().or(z.literal("")),
  contactPersonPhone: z.string().nullable().optional(),
});

export const onBoardCompanySchema = z
  .object({
    company: companySchema,
    users: z.array(onboardingUserSchema).min(1, "Atleast one user is required"),
  })
  .superRefine((data, ctx) => {
    const superAdmins = data.users.filter(
      (user) => user.role === ROLES.SUPER_ADMIN,
    );

    if (superAdmins.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["users"],
        message: "At least one SUPER_ADMIN is required",
      });
    }

    if (superAdmins.length > 1) {
      ctx.addIssue({
        code: "custom",
        path: ["users"],
        message: "Only one SUPER_ADMIN is allowed",
      });
    }
  });
