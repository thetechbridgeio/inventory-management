import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/db";

import { companies } from "../schemas/company.schema";

export async function getCompanies() {
  return db.query.companies.findMany({
    orderBy: [desc(companies.createdAt)],
  });
}