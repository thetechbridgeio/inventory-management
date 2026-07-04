import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "../schemas/product.schema";
import { mapDatabaseError } from "@/lib/errors/map-database-error";


export async function getProductFilters(
  companyId: string,
) {
  try {
    const rows = await db.query.products.findMany({
      columns: {
        category: true,
        location: true,
        unit: true,
      },
      where: eq(products.companyId, companyId),
    });

    const categories = [
      ...new Set(
        rows.map((row) => {
          const category = row.category?.trim();

          return category || "No Category";
        }),
      ),
    ].sort();

    const locations = [
      ...new Set(
        rows.map((row) => {
          const location = row.location?.trim();

          return location || "No Location";
        }),
      ),
    ].sort();

    const units = [
      ...new Set(
        rows.map((row) => {
          const unit = row.unit?.trim();

          return unit || "No Unit";
        }),
      ),
    ].sort();
    return {
      categories,
      locations,
      units,
    };
  } catch (error) {
    mapDatabaseError(error);
  }
}