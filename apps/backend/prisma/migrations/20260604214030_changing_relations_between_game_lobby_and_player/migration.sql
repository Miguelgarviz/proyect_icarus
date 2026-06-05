/*
  Warnings:

  - A unique constraint covering the columns `[actualPlayerId]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Made the column `lobbyId` on table `Game` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_lobbyId_fkey";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "lobbyId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Game_actualPlayerId_key" ON "Game"("actualPlayerId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_actualPlayerId_fkey" FOREIGN KEY ("actualPlayerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
