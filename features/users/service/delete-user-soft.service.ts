import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ROLES } from "../constants/user-role";
import { users } from "../schemas/user.schema";

export async function deleteUser(
  userId: string,
  companyId: string,
) {
  const existingUser = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.companyId, companyId),
    ),
  });

  if (
    existingUser?.role === ROLES.SUPER_ADMIN
  ) {
    const superAdmins =
      await db.query.users.findMany({
        where: and(
          eq(users.companyId, companyId),
          eq(users.role, ROLES.SUPER_ADMIN),
          eq(users.isActive, true),
        ),
      });

    if (superAdmins.length === 1) {
      throw new Error(
        "Cannot deactivate the last SUPER_ADMIN",
      );
    }
  }

  const [user] = await db
    .update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(users.id, userId),
        eq(users.companyId, companyId),
      ),
    )
    .returning();

  return user;
}