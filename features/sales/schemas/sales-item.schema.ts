import { index, integer, numeric, pgTable, uuid } from "drizzle-orm/pg-core";

import { products } from "@/features/product/schemas/product.schema";
import { sales } from "./sales.schema";

export const saleItems = pgTable(
  "sale_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    saleId: uuid("sale_id")
      .references(() => sales.id)
      .notNull(),

    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),

    quantity: integer("quantity").notNull(),

    sellingPrice: numeric("selling_price", {
      precision: 12,
      scale: 2,
      mode: "number",
    }).notNull(),

    lineTotal: numeric("line_total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    index("sale_items_sale_idx").on(table.saleId),
    index("sale_items_product_idx").on(table.productId),
    index("sale_items_sale_product_idx").on(table.saleId, table.productId),
  ],
);
