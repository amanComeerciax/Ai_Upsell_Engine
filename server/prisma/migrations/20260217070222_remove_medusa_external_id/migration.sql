-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "product_id" INTEGER,
    "quantity" INTEGER DEFAULT 1,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "shopify_id" BIGINT,
    "user_id" INTEGER,
    "total_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "shopify_id" BIGINT,
    "name" VARCHAR(150),
    "category" VARCHAR(100),
    "price" DECIMAL(10,2),
    "image_url" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upsell_events" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "order_id" INTEGER,
    "upsell_product_id" INTEGER,
    "discount_percent" INTEGER,
    "shown_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6),
    "converted" BOOLEAN DEFAULT false,

    CONSTRAINT "upsell_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upsell_rules" (
    "id" SERIAL NOT NULL,
    "trigger_product_id" INTEGER,
    "upsell_product_id" INTEGER,
    "discount_percent" INTEGER,
    "active" BOOLEAN DEFAULT true,

    CONSTRAINT "upsell_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255),
    "name" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_shopify_id_key" ON "orders"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_shopify_id_key" ON "products"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_events" ADD CONSTRAINT "upsell_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_events" ADD CONSTRAINT "upsell_events_upsell_product_id_fkey" FOREIGN KEY ("upsell_product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_events" ADD CONSTRAINT "upsell_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_rules" ADD CONSTRAINT "upsell_rules_trigger_product_id_fkey" FOREIGN KEY ("trigger_product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "upsell_rules" ADD CONSTRAINT "upsell_rules_upsell_product_id_fkey" FOREIGN KEY ("upsell_product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
