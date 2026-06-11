import "server-only";

import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { createAuthUser } from "@/features/users/service/create-auth-user.service";
import { supabaseAdmin } from "@/lib/supabase/admin";

import { CreateUserType } from "../types/user.type";

export async function createUser(
  data: CreateUserType,
  companyId: string,
) {
  let authUserId: string | null = null;

  try {
    const authUser = await createAuthUser({
      email: data.email,
      password: data.password,
    });

    authUserId = authUser.id;

    const [user] = await db
      .insert(users)
      .values({
        id: authUser.id,
        companyId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      })
      .returning();

    return user;
  } catch (error) {
    if (authUserId) {
      await supabaseAdmin.auth.admin.deleteUser(
        authUserId,
      );
    }

    throw error;
  }
}