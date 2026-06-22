ALTER TABLE "products" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "max_order_qty" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "max_order_qty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "reorder_qty" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "reorder_qty" DROP NOT NULL;