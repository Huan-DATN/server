/*
  Warnings:

  - You are about to drop the column `userId` on the `ChatMessageHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessageHistory" DROP CONSTRAINT "ChatMessageHistory_userId_fkey";

-- AlterTable
ALTER TABLE "ChatMessageHistory" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "UserChat" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "session_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChat" ADD CONSTRAINT "UserChat_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "ChatMessageHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
