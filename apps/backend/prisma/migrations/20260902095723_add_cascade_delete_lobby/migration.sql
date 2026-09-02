/*
  Warnings:

  - A unique constraint covering the columns `[lobbyCode]` on the table `Lobby` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lobbyCode,hostId]` on the table `Lobby` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[turnOrder,lobbyId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,lobbyId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - Made the column `gameId` on table `DrillCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `storeId` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `hostId` to the `Lobby` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lobbyCode` to the `Lobby` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Made the column `lobbyId` on table `Player` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gameId` on table `Tile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_storeId_fkey";

-- DropForeignKey
ALTER TABLE "DrillCard" DROP CONSTRAINT "DrillCard_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_lobbyId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_lobbyId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_shipId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_storageId_fkey";

-- DropForeignKey
ALTER TABLE "Tile" DROP CONSTRAINT "Tile_gameId_fkey";

-- AlterTable
ALTER TABLE "DrillCard" ALTER COLUMN "gameId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "storeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lobby" ADD COLUMN     "hostId" INTEGER NOT NULL,
ADD COLUMN     "lobbyCode" TEXT NOT NULL,
ALTER COLUMN "dificulty" SET DEFAULT 'BEGINNER_I',
ALTER COLUMN "numPlayers" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "lobbyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Tile" ALTER COLUMN "gameId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_lobbyCode_key" ON "Lobby"("lobbyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_lobbyCode_hostId_key" ON "Lobby"("lobbyCode", "hostId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_turnOrder_lobbyId_key" ON "Player"("turnOrder", "lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_lobbyId_key" ON "Player"("userId", "lobbyId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillCard" ADD CONSTRAINT "DrillCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
