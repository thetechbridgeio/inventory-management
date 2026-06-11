import z from "zod";
import { onboardingUserSchema } from "../validations/user.validation";
import { UserRole } from "../constants/user-role";

export type OnboardUserType = z.infer<typeof onboardingUserSchema>;

export type CreateUserType = {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
};

export type UpdateUserType = CreateUserType & { isActive: string };
