import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { UserRole } from "@/features/auth/constants/user-role";
import { users } from "@/db/schema";

export async function getUsersByRole(
  companyId: string,
  role: UserRole,
): Promise<
  {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  }[]
> {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
      })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.role, role),
          eq(users.isActive, true),
        ),
      );
  } catch (error) {
    console.error("Failed to fetch users by role:", error);

    throw mapDatabaseError("Unable to fetch users.");
  }
}