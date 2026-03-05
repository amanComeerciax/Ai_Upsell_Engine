-- AlterTable
ALTER TABLE "upsell_events" ADD COLUMN     "abandoned_cart_id" INTEGER,
ADD COLUMN     "event_type" VARCHAR(20) NOT NULL DEFAULT 'post_purchase';

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" SERIAL NOT NULL,
    "merchant_id" INTEGER,
    "cart_token" VARCHAR(255) NOT NULL,
    "customer_email" VARCHAR(255),
    "customer_name" VARCHAR(200),
    "cart_items" JSONB NOT NULL,
    "cart_total" DECIMAL(10,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "recovery_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_cart_token_key" ON "abandoned_carts"("cart_token");

-- CreateIndex
CREATE INDEX "abandoned_carts_merchant_id_idx" ON "abandoned_carts"("merchant_id");

-- CreateIndex
CREATE INDEX "abandoned_carts_customer_email_idx" ON "abandoned_carts"("customer_email");

-- CreateIndex
CREATE INDEX "abandoned_carts_status_idx" ON "abandoned_carts"("status");

-- CreateIndex
CREATE INDEX "upsell_events_event_type_idx" ON "upsell_events"("event_type");

-- AddForeignKey
ALTER TABLE "upsell_events" ADD CONSTRAINT "upsell_events_abandoned_cart_id_fkey" FOREIGN KEY ("abandoned_cart_id") REFERENCES "abandoned_carts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abandoned_carts" ADD CONSTRAINT "abandoned_carts_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
