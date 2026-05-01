-- CreateTable
CREATE TABLE "drillCard" (
    "id" SERIAL NOT NULL,
    "greenResources" INTEGER NOT NULL DEFAULT 0,
    "redResources" INTEGER NOT NULL DEFAULT 0,
    "yellowResources" INTEGER NOT NULL DEFAULT 0,
    "isSupernovaCard" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "drillCard_pkey" PRIMARY KEY ("id")
);
