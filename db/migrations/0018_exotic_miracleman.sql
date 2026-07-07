ALTER TABLE "purchases" ADD COLUMN "challan_number" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "invoice_number" text;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "work_order_number" text;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "challan_number" text;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "invoice_number" text;