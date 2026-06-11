import { eq } from "drizzle-orm";

import { db } from "@/db";
import { suppliers } from "@/db/schema";

export async function deleteSupplier(
  supplierId: string,
) {
  const [supplier] = await db
    .update(suppliers)
    .set({
      isActive: false,
    })
    .where(eq(suppliers.id, supplierId))
    .returning();

  return supplier;
}