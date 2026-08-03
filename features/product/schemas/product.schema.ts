import { sql } from "drizzle-orm";
import {
  integer,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/db/schema";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    unit: text("unit").notNull(),
    minOrderQty: integer("min_order_qty").default(0).notNull(),
    maxOrderQty: integer("max_order_qty").default(1).notNull(),
    reorderQty: integer("reorder_qty").default(0).notNull(),
    openingStock: integer("opening_stock").default(0).notNull(),
    currentStock: integer("current_stock").default(0).notNull(),
    unitCost: numeric("unit_cost"),
    location: text("location"),
    image: text("image"),
    stockMovement: text("stock_movement"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    companyIdx: index("products_company_idx").on(table.companyId),
    companyNameIdx: index("products_company_name_idx").on(
      table.companyId,
      table.name,
    ),
    companyNameCategoryUnique: uniqueIndex(
      "products_company_name_category_unique_idx",
    ).on(
      table.companyId,
      sql`lower(trim(${table.name}))`,
      sql`lower(trim(${table.category}))`,
    ),
  }),
);
