import { companies } from "@/db/schema";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import {
  PROCESS_ORDER_STATUS,
  ProcessOrderStatus,
} from "../constants/process-order-status";

export const processOrders = pgTable("process_orders", {
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
});
