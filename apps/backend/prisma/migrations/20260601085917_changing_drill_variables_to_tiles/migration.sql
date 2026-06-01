/*
  Warnings:

  - You are about to drop the column `drillTriesGreen` on the `Ship` table. All the data in the column will be lost.
  - You are about to drop the column `drillTriesRed` on the `Ship` table. All the data in the column will be lost.
  - You are about to drop the column `drillTriesYellow` on the `Ship` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ship" DROP COLUMN "drillTriesGreen",
DROP COLUMN "drillTriesRed",
DROP COLUMN "drillTriesYellow";

-- AlterTable
ALTER TABLE "Tile" ADD COLUMN     "drillAttempts" INTEGER;
