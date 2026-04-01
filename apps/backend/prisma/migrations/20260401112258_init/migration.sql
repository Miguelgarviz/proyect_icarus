-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Ship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shield" INTEGER NOT NULL DEFAULT 10,
    "drill" INTEGER NOT NULL DEFAULT 10,
    "engine" INTEGER NOT NULL DEFAULT 3,
    "positionX" INTEGER DEFAULT 0,
    "positionY" INTEGER DEFAULT 0,
    "playerId" INTEGER,
    CONSTRAINT "Ship_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Ship_playerId_key" ON "Ship"("playerId");
