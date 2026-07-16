import { companies } from "@/db/schema";
import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  PROCESS_ORDER_STATUS,
  ProcessOrderStatus,
} from "../constants/process-order-status";

export const processOrders = pgTable(
  "process_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, {
        onDelete: "cascade",
      }),

    processOrderNo: varchar("process_order_no", {
      length: 100,
    }).notNull(),

    vendorName: varchar("vendor_name", {
      length: 255,
    }),

    remarks: text("remarks"),

    status: text("status")
      .$type<ProcessOrderStatus>()
      .notNull()
      .default(PROCESS_ORDER_STATUS.SENT),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("process_orders_company_id_idx").on(table.companyId),
    index("process_orders_status_idx").on(table.status),
    index("process_orders_created_at_idx").on(table.createdAt),

    unique("process_orders_company_process_order_no_unique").on(
      table.companyId,
      table.processOrderNo,
    ),
  ],
);