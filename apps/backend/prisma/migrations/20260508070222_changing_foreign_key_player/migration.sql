/*
  Warnings:

  - You are about to drop the column `playerId` on the `Ship` table. All the data in the column will be lost.
  - You are about to drop the column `playerId` on the `Storage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shipId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storageId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Ship" DROP CONSTRAINT "Ship_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Storage" DROP CONSTRAINT "Storage_playerId_fkey";

-- DropIndex
DROP INDEX "Ship_playerId_key";

-- DropIndex
DROP INDEX "Storage_playerId_key";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "shipId" INTEGER,
ADD COLUMN     "storageId" INTEGER;

-- AlterTable
ALTER TABLE "Ship" DROP COLUMN "playerId";

-- AlterTable
ALTER TABLE "Storage" DROP COLUMN "playerId";

-- CreateIndex
CREATE UNIQUE INDEX "Player_shipId_key" ON "Player"("shipId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_storageId_key" ON "Player"("storageId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES "Storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
