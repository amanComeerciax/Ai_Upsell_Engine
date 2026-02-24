/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `upsell_events` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "upsell_events_order_id_key" ON "upsell_events"("order_id");
