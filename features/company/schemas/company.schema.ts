import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  gst: text("gst"),
  address: text("address"),
  description: text("description"),
  logoUrl: text("logo_url"),
  website: text("website"),
  contactPersonName: text("contact_person_name"),
  contactPersonEmail: text("contact_person_email"),
  contactPersonPhone: text("contact_person_phone"),
  isActive: boolean("is_active").notNull().default(true),
  lastLowStockAlertSentAt: timestamp("last_low_stock_alert_sent_at", {
    withTimezone: true,
  }),
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
