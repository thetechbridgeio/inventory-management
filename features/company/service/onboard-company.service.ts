import "server-only";

import { db } from "@/db";
import { users } from "@/features/users/schemas/user.schema";
import { createAuthUser } from "@/features/users/service/create-auth-user.service";
import { OnboardCompanyType } from "../types/company.type";
import { createCompany } from "./create-company.service";
import { companies } from "../schemas/company.schema";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function onboardCompany(
  data: OnboardCompanyType,
) {
  const authUserIds: string[] = [];
  const company = await createCompany(data.company);

  try {
    const appUsers = [];

    for (const user of data.users) {
      const authUser = await createAuthUser({
        email: user.email,
        password: user.password,
      });

      authUserIds.push(authUser.id);

      appUsers.push({
        id: authUser.id,
        companyId: company.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    }

    await db.insert(users).values(appUsers);

    return company;
  } catch (error) {
    for (const authUserId of authUserIds) {
      await supabaseAdmin.auth.admin.deleteUser(
        authUserId,
      );
    }

    await db.delete(companies).where(
      eq(companies.id, company.id),
    );

    throw error;
  }
}