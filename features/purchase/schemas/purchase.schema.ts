import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { companies, suppliers, users } from "@/db/schema";

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    supplierId: uuid("supplier_id")
      .references(() => suppliers.id)
      .notNull(),
    purchaseNumber: text("purchase_number").notNull(),
    grandTotal: numeric("grand_total", {
      precision: 12,
      scale: 2,
    }).notNull(),
    purchaseDate: date("purchase_date").notNull(),
    remarks: text("remarks"),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("purchases_company_purchase_number_idx").on(
      table.companyId,
      table.purchaseNumber,
    ),

    index("purchases_company_idx").on(table.companyId),
    index("purchases_supplier_idx").on(table.supplierId),
    index("purchases_created_by_idx").on(table.createdBy),
    index("purchases_purchase_date_idx").on(table.purchaseDate),
    index("purchases_company_purchase_date_idx").on(
      table.companyId,
      table.purchaseDate,
    ),
  ],
);
