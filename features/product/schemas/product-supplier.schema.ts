import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { companies, products, suppliers } from "@/db/schema";

export const productSuppliers = pgTable(
  "product_suppliers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    supplierId: uuid("supplier_id")
      .references(() => suppliers.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productSupplierUnique: uniqueIndex("product_supplier_unique_idx").on(
      table.productId,
      table.supplierId,
    ),
  }),
);
