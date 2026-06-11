import "server-only";

import { and, eq, ilike } from "drizzle-orm";

import { db } from "@/db";

import { users } from "../schemas/user.schema";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { UserRole } from "../constants/user-role";

type GetUsersParams = {
  companyId: string;
  page?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
};

export async function getUsers({
  companyId,
  page = DEFAULT_PAGE,
  search,
  role,
  isActive,
}: GetUsersParams) {
  const where = and(
    eq(users.companyId, companyId),
    search ? ilike(users.name, `%${search}%`) : undefined,
    role ? eq(users.role, role) : undefined,
    isActive !== undefined ? eq(users.isActive, isActive) : undefined,
  );

  const [data, total] = await Promise.all([
    db.query.users.findMany({
      where,
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit: DEFAULT_PAGE_SIZE,
      offset: (page - 1) * DEFAULT_PAGE_SIZE,
    }),

    db.$count(users, where),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE),
  };
}
