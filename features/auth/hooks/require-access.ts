// lib/auth/require-access.ts

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/users/service/get-current-user.service";
import { ACCESS, assertRoleAllowed } from "@/features/auth/constants/access";

export async function requireAccess(group: keyof typeof ACCESS) {
  const user = await getCurrentUser();

  if (!assertRoleAllowed(user.role, group)) {
    redirect("/unauthorized");
  }

  return user;
}