CREATE TABLE "process_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"process_order_no" varchar(100) NOT NULL,
	"vendor_name" varchar(255),
	"remarks" text,
	"status" text DEFAULT 'SENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"process_order_id" uuid NOT NULL,
	"sent_product_id" uuid NOT NULL,
	"received_product_id" uuid NOT NULL,
	"sent_qty" integer NOT NULL,
	"received_qty" integer,
	"sent_date" timestamp with time zone NOT NULL,
	"received_date" timestamp with time zone,
	"processing_cost" integer,
	"location" varchar(255),
	"status" text DEFAULT 'SENT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "process_orders" ADD CONSTRAINT "process_orders_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_order_items" ADD CONSTRAINT "process_order_items_process_order_id_process_orders_id_fk" FOREIGN KEY ("process_order_id") REFERENCES "public"."process_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_order_items" ADD CONSTRAINT "process_order_items_sent_product_id_products_id_fk" FOREIGN KEY ("sent_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_order_items" ADD CONSTRAINT "process_order_items_received_product_id_products_id_fk" FOREIGN KEY ("received_product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;