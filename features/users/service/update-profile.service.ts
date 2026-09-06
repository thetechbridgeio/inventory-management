import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import { users } from "../schemas/user.schema";

import { mapDatabaseError } from "@/lib/errors/map-database-error";

type UpdateProfileData = {
  name: string;
  phone?: string;
};

export async function updateProfile(
  userId: string,
  data: UpdateProfileData,
) {
  try {
    const [user] = await db
      .update(users)
      .set({
        name: data.name,
        phone: data.phone ?? null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return user;
  } catch (error) {
    mapDatabaseError(error);
  }
}
