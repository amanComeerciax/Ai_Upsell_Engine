-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "merchant_id" INTEGER;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "merchant_id" INTEGER;

-- AlterTable
ALTER TABLE "upsell_events" ADD COLUMN     "merchant_id" INTEGER;

-- AlterTable
ALTER TABLE "upsell_rules" ADD COLUMN     "merchant_id" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "merchant_id" INTEGER;

-- CreateTable
CREATE TABLE "merchants" (
    "id" SERIAL NOT NULL,
    "clerk_user_id" VARCHAR(255) NOT NULL,
    "business_name" VARCHAR(200),
    "email" VARCHAR(255),
    "shopify_shop_name" VARCHAR(200),
    "shopify_access_token" TEXT,
    "shopify_api_key" VARCHAR(200),
    "shopify_api_secret" TEXT,
    "webhook_id" VARCHAR(100),
    "plan" VARCHAR(50) DEFAULT 'free',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_clerk_user_id_key" ON "merchants"("clerk_user_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_events" ADD CONSTRAINT "upsell_events_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_rules" ADD CONSTRAINT "upsell_rules_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
