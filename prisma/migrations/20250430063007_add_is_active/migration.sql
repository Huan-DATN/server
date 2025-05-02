/*
  Warnings:

  - Added the required column `updatedAt` to the `OrderStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderStatus" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
