import z from "zod";
import { onboardingUserSchema } from "../validations/user.validation";
import { UserRole } from "../../auth/constants/user-role";

export type OnboardUserType = z.input<typeof onboardingUserSchema>;

export type UsersFormType = {
  users: OnboardUserType[];
};

export type CreateUserType = {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
};



export type UpdateUserType = CreateUserType & { isActive: string };
