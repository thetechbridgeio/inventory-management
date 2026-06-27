import { companies, users } from "@/db/schema";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const purchaseRequestStatusEnum = pgEnum("purchase_request_status", [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "PARTIALLY_APPROVED",
  "REJECTED",
]);

export const purchaseRequests = pgTable(
  "purchase_request",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, {
        onDelete: "restrict",
      }),
    requestNumber: varchar("request_number", {
      length: 50,
    }).notNull(),
    status: purchaseRequestStatusEnum("status").notNull().default("DRAFT"),
    remarks: text("remarks"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", {
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
  },
  (table) => [
    uniqueIndex("pr_company_request_number_unique").on(
      table.companyId,
      table.requestNumber,
    ),
    index("pr_company_id_idx").on(table.companyId),
    index("pr_status_idx").on(table.status),
    index("pr_created_by_user_id_idx").on(table.createdByUserId),
    index("pr_approved_by_user_id_idx").on(table.approvedByUserId),
  ],
);
