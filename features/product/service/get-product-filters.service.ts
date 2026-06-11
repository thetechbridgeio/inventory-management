import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";

import { products } from "../schemas/product.schema";

export async function getProductFilters(
  companyId: string,
) {
  const rows = await db.query.products.findMany({
    columns: {
      category: true,
      location: true,
      unit: true,
    },
    where: eq(products.companyId, companyId),
  });

  const categories = [
    ...new Set(rows.map((row) => row.category)),
  ].sort();

  const locations = [
    ...new Set(
      rows
        .map((row) => row.location)
        .filter(
          (location): location is string =>
            Boolean(location),
        ),
    ),
  ].sort();

  const units = [
    ...new Set(rows.map((row) => row.unit)),
  ].sort();

  return {
    categories,
    locations,
    units,
  };
}