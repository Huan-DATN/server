/*
  Warnings:

  - You are about to drop the `CategoryProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupProductId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoryProduct" DROP CONSTRAINT "CategoryProduct_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryProduct" DROP CONSTRAINT "CategoryProduct_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "groupProductId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shopName" TEXT;

-- DropTable
DROP TABLE "CategoryProduct";

-- CreateTable
CREATE TABLE "GroupProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToProduct_AB_unique" ON "_CategoryToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToProduct_B_index" ON "_CategoryToProduct"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_groupProductId_fkey" FOREIGN KEY ("groupProductId") REFERENCES "GroupProduct"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToProduct" ADD CONSTRAINT "_CategoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
