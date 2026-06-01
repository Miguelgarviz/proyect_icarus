/*
  Warnings:

  - Made the column `drillAttempts` on table `Tile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tile" ALTER COLUMN "drillAttempts" SET NOT NULL;
