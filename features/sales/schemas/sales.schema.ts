import {
  date,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies, users } from "@/db/schema";

export const sales = pgTable(
  "sales",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),

    saleNumber: text("sale_number").notNull(),
    soldTo: text("sold_to"),
    saleDate: date("sale_date").notNull(),
    remarks: text("remarks"),
    image: text("image"),
    grandTotal: numeric("grand_total", {
      precision: 12,
      scale: 2,
    }).notNull(),

    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sales_company_sale_number_uidx").on(
      table.companyId,
      table.saleNumber,
    ),
    index("sales_sale_number_idx").on(table.saleNumber),

    index("sales_company_idx").on(table.companyId),

    index("sales_company_sale_date_idx").on(table.companyId, table.saleDate),

    index("sales_company_created_by_idx").on(table.companyId, table.createdBy),

    index("sales_company_created_at_idx").on(table.companyId, table.createdAt),
  ],
);
