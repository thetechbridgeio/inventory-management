ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" DROP NOT NULL;