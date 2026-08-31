import { Test, TestingModule } from '@nestjs/testing';
import { TileService } from './tile.service';
import { PrismaService } from '../prisma/prisma.service';
import { TileType } from '../generated/prisma/client';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';

describe('TileService', () => {
  let service: TileService;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TileService, PrismaService],
    }).compile();

    service = module.get<TileService>(TileService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('TileService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getTileById
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getTileById', () => {
    it('should return a tile by its ID', async () => {
      const tile = testData.tiles[0];

      const result = await service.getTileById(tile.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(tile.id);
      expect(result.externalId).toBe(tile.externalId);
      expect(result.positionX).toBe(tile.positionX);
      expect(result.positionY).toBe(tile.positionY);
      expect(result.gameId).toBe(tile.gameId);
    });

    it('should throw P2025 if the tile does not exist', async () => {
      await expect(service.getTileById(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getTileByExternalId
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getTileByExternalId', () => {
    it('should return a tile by its externalId and gameId', async () => {
      const tile = testData.tiles[0];

      const result = await service.getTileByExternalId(
        tile.externalId,
        testData.game.id,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(tile.id);
      expect(result.externalId).toBe(tile.externalId);
    });

    it('should throw P2025 if the externalId does not exist in that game', async () => {
      await expect(
        service.getTileByExternalId('non_existent_tile', testData.game.id),
      ).rejects.toMatchObject({ code: 'P2025' });
    });

    it('should throw P2025 if the externalId exists but belongs to a different game', async () => {
      const tile = testData.tiles[0];

      await expect(
        service.getTileByExternalId(tile.externalId, 999999),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getTilesByCoordinates
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getTilesByCoordinates', () => {
    it('should return a tile by its coordinates and gameId', async () => {
      const tile = testData.tiles[0];

      const result = await service.getTilesByCoordinates(
        testData.game.id,
        tile.positionX,
        tile.positionY,
      );

      expect(result).toBeDefined();
      expect(result.positionX).toBe(tile.positionX);
      expect(result.positionY).toBe(tile.positionY);
      expect(result.gameId).toBe(testData.game.id);
    });

    it('should throw P2025 if no tile exists at those coordinates in that game', async () => {
      await expect(
        service.getTilesByCoordinates(testData.game.id, 999, 999),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getTilesByGameId
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getTilesByGameId', () => {
    it('should return all tiles for a given game', async () => {
      const result = await service.getTilesByGameId(testData.game.id);

      expect(result).toBeDefined();
      expect(result.length).toBe(testData.tiles.length);
      result.forEach((tile) => expect(tile.gameId).toBe(testData.game.id));
    });

    it('should return an empty array if the game has no tiles', async () => {
      const result = await service.getTilesByGameId(999999);

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createTiles
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createTiles', () => {
    it('should create EMPTY tiles with drillAttempts 0', async () => {
      const countBefore = await prisma.tile.count({
        where: { gameId: testData.game.id },
      });

      await service.createTiles(
        ['empty_test_1', 'empty_test_2'],
        TileType.EMPTY,
        [
          { x: 50, y: 0 },
          { x: 51, y: 0 },
        ],
        testData.game.id,
      );

      const countAfter = await prisma.tile.count({
        where: { gameId: testData.game.id },
      });
      expect(countAfter).toBe(countBefore + 2);

      const tile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'empty_test_1',
            gameId: testData.game.id,
          },
        },
      });
      expect(tile.drillAttempts).toBe(0);
      expect(tile.type).toBe(TileType.EMPTY);
    });

    it('should create GREEN tiles with drillAttempts 3', async () => {
      await service.createTiles(
        ['green_test_1'],
        TileType.GREEN,
        [{ x: 52, y: 0 }],
        testData.game.id,
      );

      const tile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'green_test_1',
            gameId: testData.game.id,
          },
        },
      });
      expect(tile.drillAttempts).toBe(3);
      expect(tile.type).toBe(TileType.GREEN);
    });

    it('should create RED tiles with drillAttempts 2', async () => {
      await service.createTiles(
        ['red_test_1'],
        TileType.RED,
        [{ x: 53, y: 0 }],
        testData.game.id,
      );

      const tile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'red_test_1',
            gameId: testData.game.id,
          },
        },
      });
      expect(tile.drillAttempts).toBe(2);
      expect(tile.type).toBe(TileType.RED);
    });

    it('should create YELLOW tiles with drillAttempts 1', async () => {
      await service.createTiles(
        ['yellow_test_1'],
        TileType.YELLOW,
        [{ x: 54, y: 0 }],
        testData.game.id,
      );

      const tile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'yellow_test_1',
            gameId: testData.game.id,
          },
        },
      });
      expect(tile.drillAttempts).toBe(1);
      expect(tile.type).toBe(TileType.YELLOW);
    });

    it('should create SPACE_STATION tiles with drillAttempts 0', async () => {
      await service.createTiles(
        ['space_station_test_1'],
        TileType.SPACE_STATION,
        [{ x: 55, y: 0 }],
        testData.game.id,
      );

      const tile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'space_station_test_1',
            gameId: testData.game.id,
          },
        },
      });
      expect(tile.drillAttempts).toBe(0);
      expect(tile.type).toBe(TileType.SPACE_STATION);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // isTileOccupied
  // ─────────────────────────────────────────────────────────────────────────────

  describe('isTileOccupied', () => {
    it('should return the playerId when the tile is occupied', async () => {
      const result = await service.isTileOccupied(testData.game.id, 0, 1);

      expect(result).toBe(testData.player2.id);
    });

    it('should return null when the tile is not occupied', async () => {
      // Una tile vacía del seed (por ejemplo la posición 1,0)
      const result = await service.isTileOccupied(testData.game.id, 1, 2);

      expect(result).toBeNull();
    });

    it('should throw P2025 if the tile does not exist', async () => {
      await expect(
        service.isTileOccupied(testData.game.id, 999, 999),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // decreaseDrillAttempts
  // ─────────────────────────────────────────────────────────────────────────────

  describe('decreaseDrillAttempts', () => {
    it('should decrement drillAttempts by 1', async () => {
      const greenTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'green_test_1',
            gameId: testData.game.id,
          },
        },
      });

      const result = await service.decreaseDrillAttempts(greenTile.id);

      expect(result.drillAttempts).toBe(greenTile.drillAttempts - 1);

      const tileInDb = await prisma.tile.findUniqueOrThrow({
        where: { id: greenTile.id },
      });
      expect(tileInDb.drillAttempts).toBe(greenTile.drillAttempts - 1);
    });

    it('should allow drillAttempts to go below 0 (el servicio no lo limita)', async () => {
      const emptyTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'empty_test_1',
            gameId: testData.game.id,
          },
        },
      });

      const result = await service.decreaseDrillAttempts(emptyTile.id);

      expect(result.drillAttempts).toBe(-1);
    });

    it('should throw P2025 if the tile does not exist', async () => {
      await expect(service.decreaseDrillAttempts(999999)).rejects.toMatchObject(
        {
          code: 'P2025',
        },
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // resetDrillAttempts
  // ─────────────────────────────────────────────────────────────────────────────

  describe('resetDrillAttempts', () => {
    it('should reset GREEN tiles to 3, RED to 2, YELLOW to 1 and others to 0', async () => {
      // Reducimos los drillAttempts de algunas tiles para que el reset tenga efecto visible
      const greenTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'green_test_1',
            gameId: testData.game.id,
          },
        },
      });
      const redTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'red_test_1',
            gameId: testData.game.id,
          },
        },
      });
      const yellowTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'yellow_test_1',
            gameId: testData.game.id,
          },
        },
      });

      await prisma.tile.update({
        where: { id: greenTile.id },
        data: { drillAttempts: 0 },
      });
      await prisma.tile.update({
        where: { id: redTile.id },
        data: { drillAttempts: 0 },
      });
      await prisma.tile.update({
        where: { id: yellowTile.id },
        data: { drillAttempts: 0 },
      });

      await service.resetDrillAttempts(testData.game.id);

      const updatedGreen = await prisma.tile.findUniqueOrThrow({
        where: { id: greenTile.id },
      });
      const updatedRed = await prisma.tile.findUniqueOrThrow({
        where: { id: redTile.id },
      });
      const updatedYellow = await prisma.tile.findUniqueOrThrow({
        where: { id: yellowTile.id },
      });

      expect(updatedGreen.drillAttempts).toBe(3);
      expect(updatedRed.drillAttempts).toBe(2);
      expect(updatedYellow.drillAttempts).toBe(1);
    });

    it('should reset EMPTY and SPACE_STATION tiles to 0', async () => {
      const emptyTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'empty_test_2',
            gameId: testData.game.id,
          },
        },
      });
      const stationTile = await prisma.tile.findUniqueOrThrow({
        where: {
          externalId_gameId: {
            externalId: 'space_station_test_1',
            gameId: testData.game.id,
          },
        },
      });

      // Les ponemos un valor distinto de 0 para verificar que el reset funciona
      await prisma.tile.update({
        where: { id: emptyTile.id },
        data: { drillAttempts: 5 },
      });
      await prisma.tile.update({
        where: { id: stationTile.id },
        data: { drillAttempts: 5 },
      });

      await service.resetDrillAttempts(testData.game.id);

      const updatedEmpty = await prisma.tile.findUniqueOrThrow({
        where: { id: emptyTile.id },
      });
      const updatedStation = await prisma.tile.findUniqueOrThrow({
        where: { id: stationTile.id },
      });

      expect(updatedEmpty.drillAttempts).toBe(0);
      expect(updatedStation.drillAttempts).toBe(0);
    });

    it('should do nothing if the game has no tiles', async () => {
      // No debe lanzar ningún error aunque no haya tiles
      await expect(service.resetDrillAttempts(999999)).resolves.not.toThrow();
    });
  });
});
