import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema";

import { NotFoundError } from "@/lib/errors/not-found-error";
import { mapDatabaseError } from "@/lib/errors/map-database-error";

export async function deleteSupplier(
  supplierId: string,
  companyId: string,
) {
  try {
    const [supplier] = await db
      .update(suppliers)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(suppliers.id, supplierId),
          eq(suppliers.companyId, companyId),
        ),
      )
      .returning();

    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    return supplier;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    mapDatabaseError(error);
  }
}