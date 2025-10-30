/*
  Warnings:

  - You are about to drop the column `customerName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerName",
DROP COLUMN "customerPhone",
ADD COLUMN     "paymentDetails" VARCHAR(100),
ADD COLUMN     "paymentMethod" VARCHAR(50),
ALTER COLUMN "orderCode" SET DATA TYPE VARCHAR(100);
