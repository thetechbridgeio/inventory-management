import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { createClient } from "../../../lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new Error("Unauthorized");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.id),
    with: {
      company: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isActive) {
    throw new Error("User is inactive");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    companyId: user.company.id,
    companyName: user.company.name,
    companyLogo: user.company.logoUrl,
  };
}