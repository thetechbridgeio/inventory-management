import "server-only";

import { db } from "@/db";

import { companies } from "../schemas/company.schema";
import { CreateCompanyFormType } from "../types/company.type";

export async function createCompany(
  data: CreateCompanyFormType
) {
  const [company] = await db
    .insert(companies)
    .values(data)
    .returning();

  return company;
}