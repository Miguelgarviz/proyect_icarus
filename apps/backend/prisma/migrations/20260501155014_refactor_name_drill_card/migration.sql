/*
  Warnings:

  - You are about to drop the `drillCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "drillCard" DROP CONSTRAINT "drillCard_gameId_fkey";

-- DropTable
DROP TABLE "drillCard";

-- CreateTable
CREATE TABLE "DrillCard" (
    "id" SERIAL NOT NULL,
    "greenResources" INTEGER NOT NULL DEFAULT 0,
    "redResources" INTEGER NOT NULL DEFAULT 0,
    "yellowResources" INTEGER NOT NULL DEFAULT 0,
    "isSupernovaCard" BOOLEAN NOT NULL DEFAULT false,
    "gameId" INTEGER,

    CONSTRAINT "DrillCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DrillCard" ADD CONSTRAINT "DrillCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
