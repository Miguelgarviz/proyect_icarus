/*
  Warnings:

  - A unique constraint covering the columns `[name,lobbyId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[color,lobbyId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalId,gameId]` on the table `Tile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externalId` to the `Tile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tile" ADD COLUMN     "externalId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Player_name_lobbyId_key" ON "Player"("name", "lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_color_lobbyId_key" ON "Player"("color", "lobbyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tile_externalId_gameId_key" ON "Tile"("externalId", "gameId");
