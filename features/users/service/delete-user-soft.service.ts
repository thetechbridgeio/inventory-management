import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import { users } from "../schemas/user.schema";

import { ROLES } from "../../auth/constants/user-role";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function deleteUser(
  userId: string,
  companyId: string,
) {
  try {
    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.id, userId),
        eq(users.companyId, companyId),
      ),
    });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (existingUser.role === ROLES.SUPER_ADMIN) {
      const superAdminCount = await db.$count(
        users,
        and(
          eq(users.companyId, companyId),
          eq(users.role, ROLES.SUPER_ADMIN),
          eq(users.isActive, true),
        ),
      );

      if (superAdminCount === 1) {
        throw new BusinessRuleError(
          "Cannot deactivate the last Super Admin."
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
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof BusinessRuleError
    ) {
      throw error;
    }

    mapDatabaseError(error);
  }
}