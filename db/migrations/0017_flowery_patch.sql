CREATE TYPE "public"."purchase_request_status" AS ENUM('PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."purchase_request_item_status" AS ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTION_REQUIRED');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('EMAIL_PENDING', 'EMAIL_SENT');--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"purchase_request_number" text NOT NULL,
	"status" "purchase_request_status" DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"remarks" text,
	"total_items" integer NOT NULL,
	"total_requested_qty" integer NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"processed_by_user_id" uuid,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_requests_purchase_request_number_unique" UNIQUE("purchase_request_number")
);
--> statement-breakpoint
CREATE TABLE "purchase_request_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"requested_qty" integer NOT NULL,
	"approved_qty" integer,
	"status" "purchase_request_item_status" DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"supplier_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"purchase_request_item_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"ordered_qty" integer NOT NULL,
	"received_qty" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"purchase_order_number" text NOT NULL,
	"purchase_request_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "purchase_order_status" DEFAULT 'EMAIL_PENDING' NOT NULL,
	"remarks" text,
	"total_items" integer NOT NULL,
	"total_ordered_qty" integer NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_orders_purchase_order_number_unique" UNIQUE("purchase_order_number")
);
--> statement-breakpoint
CREATE INDEX "purchase_requests_company_id_idx" ON "purchase_requests" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "purchase_requests_created_by_user_id_idx" ON "purchase_requests" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "purchase_request_items_purchase_request_id_idx" ON "purchase_request_items" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE INDEX "purchase_request_items_supplier_id_idx" ON "purchase_request_items" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items" USING btree ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_company_id_idx" ON "purchase_orders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_purchase_request_id_idx" ON "purchase_orders" USING btree ("purchase_request_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders" USING btree ("supplier_id");