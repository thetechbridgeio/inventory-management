import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/features/company/schemas/company.schema";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  companyName: text("company_name").notNull(),
  contactPersonName: text("contact_person_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  gst: text("gst"),
  estimatedDeliveryPeriod: integer("estimated_delivery_period"),
  paymentTerm: text("payment_term"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});
