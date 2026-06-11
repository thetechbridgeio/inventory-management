import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "../schemas/company.schema";

export async function getCompanyById(
  companyId: string,
) {
  return db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: {
      users: true,
    },
  });
}