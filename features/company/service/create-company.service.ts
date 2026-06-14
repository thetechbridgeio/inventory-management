import "server-only";

import { db } from "@/db";

import { companies } from "../schemas/company.schema";
import { CreateCompanyFormType, CreateCompanyType } from "../types/company.type";

export async function createCompany(
  data: CreateCompanyType
) {
  const [company] = await db
    .insert(companies)
    .values(data)
    .returning();

  return company;
}