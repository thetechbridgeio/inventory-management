import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { UserRole } from "@/features/auth/constants/user-role";

export async function getUsersByRoles(
  companyId: string,
  roles: UserRole[],
): Promise<
  {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  }[]
> {
  try {
    if (roles.length === 0) {
      return [];
    }

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
          inArray(users.role, roles),
          eq(users.isActive, true),
        ),
      );
  } catch (error) {
    console.error("Failed to fetch users by roles:", error);

    throw mapDatabaseError("Unable to fetch users.");
  }
}