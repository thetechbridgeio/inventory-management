import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import { users } from "@/features/users/schemas/user.schema";
import { createAuthUser } from "@/features/users/service/create-auth-user.service";

import { companies } from "../schemas/company.schema";

import { OnboardCompanyServiceType } from "../types/company.type";

import { createCompany } from "./create-company.service";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { ExternalServiceError } from "@/lib/errors/external-service-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function onboardCompany(data: OnboardCompanyServiceType) {
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
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (rollbackError) {
        console.error("Failed to rollback auth user:", rollbackError);
      }
    }

    try {
      await db.delete(companies).where(eq(companies.id, company.id));
    } catch (rollbackError) {
      console.error("Failed to rollback company:", rollbackError);
    }

    if (error instanceof ExternalServiceError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}
