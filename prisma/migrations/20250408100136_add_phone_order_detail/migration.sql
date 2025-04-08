/*
  Warnings:

  - Added the required column `phone` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "phone" TEXT NOT NULL;
