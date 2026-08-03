import { and, eq, isNotNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";
import { companies } from "../schemas/company.schema";
import { ROLES } from "@/features/auth/constants/user-role";

export async function getReceiverPhones() {
  try {
    return await db
      .select({
        companyId: users.companyId,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
        phone: users.phone,
      })
      .from(users)
      .innerJoin(companies, eq(users.companyId, companies.id))
      .where(
        and(
          eq(users.role, ROLES.SUPER_ADMIN),
          eq(users.isActive, true),
          eq(companies.isActive, true),
          isNotNull(users.phone),
          ne(users.phone, ""),
        ),
      );
  } catch (error) {
    throw mapDatabaseError(error);
  }
}
