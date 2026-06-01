/*
  Warnings:

  - You are about to drop the column `isDeath` on the `Player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "isDeath",
ADD COLUMN     "isDead" BOOLEAN NOT NULL DEFAULT false;
