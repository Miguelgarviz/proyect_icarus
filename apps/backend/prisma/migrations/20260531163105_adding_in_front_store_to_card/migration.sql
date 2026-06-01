/*
  Warnings:

  - You are about to drop the `Cards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Cards" DROP CONSTRAINT "Cards_storeId_fkey";

-- DropTable
DROP TABLE "Cards";

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "storeId" INTEGER,
    "cost" INTEGER NOT NULL,
    "type" "CardType" NOT NULL,
    "inFrontStore" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
