/*
  Warnings:

  - You are about to drop the column `attributes` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "attributes",
DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "upsell_events" ADD COLUMN     "impression_count" INTEGER NOT NULL DEFAULT 0;
