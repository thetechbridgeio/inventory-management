import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { companies } from "../schemas/company.schema";
import { ROLES } from "@/features/auth/constants/user-role";

export async function getReceiverEmails() {
  try {
    return await db
      .select({
        companyId: users.companyId,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        email: users.email,
      })
      .from(users)
      .innerJoin(companies, eq(users.companyId, companies.id))
      .where(
        and(
          eq(users.role, ROLES.SUPER_ADMIN),
          eq(users.isActive, true),
          eq(companies.isActive, true)
        )
      );
  } catch (error) {
    throw mapDatabaseError(error);
  }
}