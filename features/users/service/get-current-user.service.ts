import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { createClient } from "@/lib/supabase/server";

import { AuthenticationError } from "@/lib/errors/authentication-error";
import { AuthorizationError } from "@/lib/errors/authorization-error";
import { DatabaseError } from "@/lib/errors/database-error";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new AuthenticationError();
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
      with: {
        company: true,
      },
    });

    if (!user) {
      throw new AuthenticationError("User not found");
    }
 
    if (!user.isActive) {
      throw new AuthorizationError("User is inactive");
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
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    if (error instanceof AuthorizationError) throw error;

    throw new DatabaseError("Failed to retrieve current user", error);
  }
}