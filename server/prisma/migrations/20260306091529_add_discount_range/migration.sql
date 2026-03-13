-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "discount_max" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "discount_min" INTEGER NOT NULL DEFAULT 5;
