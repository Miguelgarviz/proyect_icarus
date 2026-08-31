import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TileController } from './tile.controller';
import { TileService } from './tile.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';
import { Tile, TileType } from '../generated/prisma/client';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';

const request = require('supertest');

describe('TileController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;
  let testTile: Tile;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TileController],
      providers: [TileService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    testData = await seedTestDatabase(prisma);

    testTile = testData.tiles.find((t) => t.externalId == 'red_planet_1')!;
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await app.close();
  });

  describe('GET /tile/:id', () => {
    it('should return 200 and the tile when it exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tile/${testTile.id}`)
        .expect(200);

      expect(response.body.id).toBe(testTile.id);
      expect(response.body.externalId).toBe('red_planet_1');
      expect(response.body.drillAttempts).toBe(0);
      expect(response.body.gameId).toBe(testData.game.id);
      expect(response.body.ocupiedByPlayerId).toBe(testData.player2.id);
      expect(response.body.positionX).toBe(0);
      expect(response.body.positionY).toBe(1);
      expect(response.body.type).toBe(TileType.RED);
    });

    it('should return 404 when the tile does not exist', async () => {
      await request(app.getHttpServer()).get('/tile/999999').expect(404);
    });

    it('should handle a non-numeric id gracefully', async () => {
      // Number('abc') es NaN — Prisma recibirá NaN y fallará
      await request(app.getHttpServer()).get('/tile/abc').expect(400);
    });
  });
  describe('POST /:gameId/game', () => {
    it('should return 200 when creating tiles correctly', async () => {
      await request(app.getHttpServer())
        .post(`/tile/${testData.game2.id}/game`)
        .expect(201);
    });
    it('should return 400 when the game does not exist', async () => {
      await request(app.getHttpServer()).post(`/tile/99999/game`).expect(400);
    });
  });
  describe('GET /:gameId/externalId/:externalId', () => {
    it('should return 200 and the tile by his externalId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tile/${testData.game.id}/externalId/${'red_planet_1'}`)
        .expect(200);

      expect(response.body.id).toBe(testTile.id);
      expect(response.body.externalId).toBe('red_planet_1');
      expect(response.body.drillAttempts).toBe(0);
      expect(response.body.gameId).toBe(testData.game.id);
      expect(response.body.ocupiedByPlayerId).toBe(testData.player2.id);
      expect(response.body.positionX).toBe(0);
      expect(response.body.positionY).toBe(1);
      expect(response.body.type).toBe(TileType.RED);
    });
    it('should return 404 when the externalId does no exist', async () => {
      await request(app.getHttpServer())
        .get(`/tile/${testData.game.id}/externalId/${'wrong_external_id'}`)
        .expect(404);
    });
    it('should return 404 when the game does no exist', async () => {
      await request(app.getHttpServer())
        .get(`/tile/99999/externalId/${'red_planet_1'}`)
        .expect(404);
    });
  });
  describe('GET /:gameId/coordinates', () => {
    it('should return 200 and the tile by his coordinates', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tile/${testData.game.id}/coordinates`)
        .query({ x: '0', y: '1' })
        .expect(200);

      expect(response.body.id).toBe(testTile.id);
      expect(response.body.externalId).toBe('red_planet_1');
      expect(response.body.drillAttempts).toBe(0);
      expect(response.body.gameId).toBe(testData.game.id);
      expect(response.body.ocupiedByPlayerId).toBe(testData.player2.id);
      expect(response.body.positionX).toBe(0);
      expect(response.body.positionY).toBe(1);
      expect(response.body.type).toBe(TileType.RED);
    });
    it('should return 404 if the coordinates does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/tile/${testData.game.id}/coordinates`)
        .query({ x: '999', y: '999' })
        .expect(404);
    });
    it('should return 404 if the game does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/tile/9999/coordinates`)
        .query({ x: '0', y: '1' })
        .expect(404);
    });
  });
  describe('GET /game/:gameId', () => {
    it('should return 200 and the tiles of a game', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tile/game/${testData.game2.id}`)
        .expect(200);

      expect(response.body.length).toBe(58);
    });
  });
});
