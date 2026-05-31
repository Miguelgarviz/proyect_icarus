/*
  Warnings:

  - You are about to drop the column `nextPlayerId` on the `Game` table. All the data in the column will be lost.
  - Added the required column `turnOrder` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "nextPlayerId";

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "turnOrder" INTEGER NOT NULL;
