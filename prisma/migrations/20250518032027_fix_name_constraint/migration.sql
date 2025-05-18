/*
  Warnings:

  - You are about to drop the column `sessionId` on the `ChatMessageHistory` table. All the data in the column will be lost.
  - Added the required column `session_id` to the `ChatMessageHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatMessageHistory" DROP CONSTRAINT "ChatMessageHistory_userId_fkey";

-- DropIndex
DROP INDEX "idx_session_id";

-- AlterTable
ALTER TABLE "ChatMessageHistory" DROP COLUMN "sessionId",
ADD COLUMN     "session_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_session_id" ON "ChatMessageHistory"("session_id");

-- AddForeignKey
ALTER TABLE "ChatMessageHistory" ADD CONSTRAINT "ChatMessageHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
