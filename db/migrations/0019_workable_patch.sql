CREATE TYPE "public"."purchase_request_status" AS ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "purchase_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"request_number" varchar(50) NOT NULL,
	"status" "purchase_request_status" DEFAULT 'DRAFT' NOT NULL,
	"remarks" text,
	"created_by_user_id" uuid NOT NULL,
	"approved_by_user_id" uuid,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_request_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"supplier_id" uuid,
	"requested_qty" integer NOT NULL,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pri_requested_qty_positive" CHECK ("purchase_request_item"."requested_qty" > 0)
);
--> statement-breakpoint
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request" ADD CONSTRAINT "purchase_request_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_item" ADD CONSTRAINT "purchase_request_item_purchase_request_id_purchase_request_id_fk" FOREIGN KEY ("purchase_request_id") REFERENCES "public"."purchase_request"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_item" ADD CONSTRAINT "purchase_request_item_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_request_item" ADD CONSTRAINT "purchase_request_item_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pr_company_request_number_unique" ON "purchase_request" USING btree ("company_id","request_number");--> statement-breakpoint
CREATE INDEX "pr_company_id_idx" ON "purchase_request" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "pr_status_idx" ON "purchase_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pr_created_by_user_id_idx" ON "purchase_request" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "pr_approved_by_user_id_idx" ON "purchase_request" USING btree ("approved_by_user_id");--> statement-breakpoint
CREATE INDEX "pri_purchase_request_id_idx" ON "purchase_request_item" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE INDEX "pri_product_id_idx" ON "purchase_request_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "pri_supplier_id_idx" ON "purchase_request_item" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pri_purchase_request_product_unique" ON "purchase_request_item" USING btree ("purchase_request_id","product_id");