/*
  Warnings:

  - Added the required column `shopId` to the `OrderDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderDetail" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_OrderDetailToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderDetailToUser_AB_unique" ON "_OrderDetailToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderDetailToUser_B_index" ON "_OrderDetailToUser"("B");

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderDetailToUser" ADD CONSTRAINT "_OrderDetailToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "OrderDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderDetailToUser" ADD CONSTRAINT "_OrderDetailToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
