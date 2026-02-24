-- AlterTable
ALTER TABLE "upsell_events" ADD COLUMN     "pitch" TEXT,
ADD COLUMN     "test_group" VARCHAR(10);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "test_group" VARCHAR(10);

-- CreateIndex
CREATE INDEX "orders_merchant_id_idx" ON "orders"("merchant_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "products_merchant_id_idx" ON "products"("merchant_id");

-- CreateIndex
CREATE INDEX "upsell_events_merchant_id_idx" ON "upsell_events"("merchant_id");

-- CreateIndex
CREATE INDEX "upsell_events_user_id_idx" ON "upsell_events"("user_id");

-- CreateIndex
CREATE INDEX "upsell_events_order_id_idx" ON "upsell_events"("order_id");

-- CreateIndex
CREATE INDEX "users_merchant_id_idx" ON "users"("merchant_id");
