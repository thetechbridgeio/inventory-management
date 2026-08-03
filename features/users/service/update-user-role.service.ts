import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";

import { users } from "../schemas/user.schema";

import { ROLES, UserRole } from "../../auth/constants/user-role";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { BusinessRuleError } from "@/lib/errors/business-rule-error";
import { ValidationError } from "@/lib/errors/validation-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function updateUserRole(
  userId: string,
  companyId: string,
  role: UserRole,
) {
  try {
    if (!Object.values(ROLES).includes(role)) {
      throw new ValidationError("Invalid role");
    }

    const existingUser = await db.query.users.findFirst({
      where: and(
        eq(users.id, userId),
        eq(users.companyId, companyId),
      ),
    });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (
      existingUser.role === ROLES.SUPER_ADMIN &&
      role !== ROLES.SUPER_ADMIN
    ) {
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
          "Cannot change role of the last Super Admin."
        );
      }
    }

    const [user] = await db
      .update(users)
      .set({
        role,
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
      error instanceof BusinessRuleError ||
      error instanceof ValidationError
    ) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
