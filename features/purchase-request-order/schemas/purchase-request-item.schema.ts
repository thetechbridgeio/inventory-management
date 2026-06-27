import { products, suppliers } from "@/db/schema";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { purchaseRequests } from "./purchase-request.schema";

export const purchaseRequestItems = pgTable(
  "purchase_request_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    purchaseRequestId: uuid("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, {
        onDelete: "cascade",
      }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "restrict",
      }),
    supplierId: uuid("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    requestedQty: integer("requested_qty").notNull(),
    // Optional note for this specific item.
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("pri_purchase_request_id_idx").on(table.purchaseRequestId),
    index("pri_product_id_idx").on(table.productId),
    index("pri_supplier_id_idx").on(table.supplierId),

    // Prevent duplicate products within the same Purchase Request.
    uniqueIndex("pri_purchase_request_product_unique").on(
      table.purchaseRequestId,
      table.productId
    ),

    // Quantity must be greater than zero.
    check(
      "pri_requested_qty_positive",
      sql`${table.requestedQty} > 0`
    ),
  ]
);