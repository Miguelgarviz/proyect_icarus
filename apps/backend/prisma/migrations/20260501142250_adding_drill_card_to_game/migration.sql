-- AlterTable
ALTER TABLE "drillCard" ADD COLUMN     "gameId" INTEGER;

-- AddForeignKey
ALTER TABLE "drillCard" ADD CONSTRAINT "drillCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
