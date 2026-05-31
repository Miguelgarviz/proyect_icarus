/*
  Warnings:

  - Added the required column `nextPlayerId` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Made the column `actualPlayerId` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Made the column `positionX` on table `Ship` required. This step will fail if there are existing NULL values in that column.
  - Made the column `positionY` on table `Ship` required. This step will fail if there are existing NULL values in that column.
  - Made the column `externalId` on table `Ship` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "nextPlayerId" INTEGER NOT NULL,
ALTER COLUMN "actualPlayerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ship" ALTER COLUMN "positionX" SET NOT NULL,
ALTER COLUMN "positionY" SET NOT NULL,
ALTER COLUMN "externalId" SET NOT NULL;
