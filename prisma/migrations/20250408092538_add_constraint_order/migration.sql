/*
  Warnings:

  - You are about to drop the column `orderStatusId` on the `OrderDetail` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OrderStatus` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `OrderStatus` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OrderStatus` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId,statusId]` on the table `OrderStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `OrderStatus` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `OrderStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderDetail" DROP CONSTRAINT "OrderDetail_orderStatusId_fkey";

-- AlterTable
ALTER TABLE "OrderDetail" DROP COLUMN "orderStatusId";

-- AlterTable
ALTER TABLE "OrderStatus" DROP COLUMN "name",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "type" "OrderStatusType" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderStatus_orderId_statusId_key" ON "OrderStatus"("orderId", "statusId");

-- AddForeignKey
ALTER TABLE "OrderStatus" ADD CONSTRAINT "OrderStatus_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatus" ADD CONSTRAINT "OrderStatus_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
