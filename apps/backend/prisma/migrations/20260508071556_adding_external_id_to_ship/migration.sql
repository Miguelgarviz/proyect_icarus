/*
  Warnings:

  - A unique constraint covering the columns `[externalId,id]` on the table `Ship` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ship" ADD COLUMN     "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ship_externalId_id_key" ON "Ship"("externalId", "id");
