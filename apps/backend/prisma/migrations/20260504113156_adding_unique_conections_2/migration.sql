/*
  Warnings:

  - A unique constraint covering the columns `[positionX,positionY,gameId]` on the table `Tile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tile_positionX_positionY_gameId_key" ON "Tile"("positionX", "positionY", "gameId");
