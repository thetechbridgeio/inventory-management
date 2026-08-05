ALTER TABLE "products" ADD COLUMN "images" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
UPDATE "products" SET "images" = ARRAY["image"] WHERE "image" IS NOT NULL AND "image" <> '';--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_images_max_count_check" CHECK (array_length("products"."images", 1) IS NULL OR array_length("products"."images", 1) <= 5);
