ALTER TABLE "purchase_requests" DROP CONSTRAINT "purchase_requests_purchase_request_number_unique";--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_purchase_order_number_unique";--> statement-breakpoint
CREATE INDEX "process_orders_company_id_idx" ON "process_orders" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "process_orders_status_idx" ON "process_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "process_orders_created_at_idx" ON "process_orders" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_company_pr_no_unique" UNIQUE("company_id","purchase_request_number");--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_order_company_pr_no_unique" UNIQUE("company_id","purchase_order_number");--> statement-breakpoint
ALTER TABLE "process_orders" ADD CONSTRAINT "process_orders_company_process_order_no_unique" UNIQUE("company_id","process_order_no");