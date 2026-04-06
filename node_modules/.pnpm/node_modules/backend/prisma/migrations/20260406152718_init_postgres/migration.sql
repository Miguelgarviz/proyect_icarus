-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('TEMPORARY_PATCH', 'NEW_DRILL', 'BACKUP_POWER', 'SLINGSHOT', 'ENHANCED_SCANNER', 'ROCKET_THRUSTERS');

-- CreateEnum
CREATE TYPE "TileType" AS ENUM ('EMPTY', 'GREEN', 'RED', 'YELLOW', 'SPACE_STATION', 'START');

-- CreateEnum
CREATE TYPE "Dificulty" AS ENUM ('BEGINNER_I', 'BEGINNER_II', 'EASY_I', 'EASY_II', 'MEDIUM_I', 'MEDIUM_II', 'HARD_I', 'HARD_II', 'EXTREME_I', 'EXTREME_II', 'IMPOSSIBLE');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "movement" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "lobbyId" INTEGER,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ship" (
    "id" SERIAL NOT NULL,
    "shield" INTEGER NOT NULL DEFAULT 10,
    "drill" INTEGER NOT NULL DEFAULT 10,
    "engine" INTEGER NOT NULL DEFAULT 3,
    "positionX" INTEGER DEFAULT 0,
    "positionY" INTEGER DEFAULT 0,
    "playerId" INTEGER,

    CONSTRAINT "Ship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "id" SERIAL NOT NULL,
    "green" INTEGER NOT NULL DEFAULT 0,
    "red" INTEGER NOT NULL DEFAULT 0,
    "yellow" INTEGER NOT NULL DEFAULT 0,
    "playerId" INTEGER,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cards" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "storeId" INTEGER,
    "cost" INTEGER NOT NULL,
    "type" "CardType" NOT NULL,

    CONSTRAINT "Cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "numCards" INTEGER NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tile" (
    "id" SERIAL NOT NULL,
    "type" "TileType" NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dificulty" "Dificulty" NOT NULL,
    "numPlayers" INTEGER NOT NULL,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "lobbyId" INTEGER,
    "round" INTEGER NOT NULL DEFAULT 0,
    "actualPlayerId" INTEGER,
    "supernovaLvL" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ship_playerId_key" ON "Ship"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Storage_playerId_key" ON "Storage"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_lobbyId_key" ON "Game"("lobbyId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ship" ADD CONSTRAINT "Ship_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cards" ADD CONSTRAINT "Cards_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cards" ADD CONSTRAINT "Cards_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE SET NULL ON UPDATE CASCADE;
