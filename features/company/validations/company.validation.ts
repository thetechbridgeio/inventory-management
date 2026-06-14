import { z } from "zod";

import { ROLES } from "@/features/auth/constants/user-role";
import { onboardingUserSchema } from "@/features/users/validations/user.validation";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.url("Please enter a valid URL").optional(),
);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.email("Invalid email address").optional(),
);

const optionalPhone = z
  .preprocess(emptyToUndefined, z.string().optional())
  .transform((val) => {
    if (!val) return undefined;
    const phone = val.replace(/[\s-]/g, "");
    return phone.startsWith("+91") ? phone : `+91${phone}`;
  })
  .refine(
    (val) => !val || /^\+91\d{10}$/.test(val),
    "Phone number must be a valid Indian number",
  );

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required"),

  gst: z
    .preprocess(emptyToUndefined, z.string().trim().optional())
    .transform((val) => val?.toUpperCase())
    .refine((val) => !val || GST_REGEX.test(val), "Invalid GSTIN format"),

  address: z.preprocess(emptyToUndefined, z.string().trim().optional()),

  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),

  logoUrl: optionalUrl,

  website: optionalUrl,

  contactPersonName: z.preprocess(
    emptyToUndefined,
    z.string().trim().optional(),
  ),

  contactPersonEmail: optionalEmail,

  contactPersonPhone: optionalPhone,
});

export const onBoardCompanySchema = z
  .object({
    company: companySchema,

    users: z
      .array(onboardingUserSchema)
      .min(1, "At least one user is required"),
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
