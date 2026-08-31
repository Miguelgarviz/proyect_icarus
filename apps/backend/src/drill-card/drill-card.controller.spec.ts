import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DrillCardController } from './drill-card.controller';
import { DrillCardService } from './drill-card.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';
import { DrillCard } from '../generated/prisma/client';

const request = require('supertest');

describe('CardController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;
  let testDrillCard: DrillCard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrillCardController],
      providers: [DrillCardService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    testData = await seedTestDatabase(prisma);
    testDrillCard = testData.drillCards.find(
      (dc) => dc.gameId === testData.game.id,
    )!;
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await app.close();
  });

  describe('GET /drill-card', () => {
    it('should return a 200 and all the drillCards', async () => {
      const response = await request(app.getHttpServer())
        .get('/drill-card')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThanOrEqual(
        testData.drillCards.length,
      );
    });
  });
  describe('GET /drill-card/:id', () => {
    it('should return a 200 and the drillcard by his Id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/drill-card/${testDrillCard.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(testDrillCard.id);
      expect(response.body.greenResources).toBe(testDrillCard.greenResources);
      expect(response.body.redResources).toBe(testDrillCard.redResources);
      expect(response.body.yellowResources).toBe(testDrillCard.yellowResources);
      expect(response.body.gameId).toBe(testDrillCard.gameId);
      expect(response.body.isSupernovaCard).toBe(testDrillCard.isSupernovaCard);
    });
    it('should return a 404 if the drillcard does not exist', async () => {
      await request(app.getHttpServer()).get(`/drill-card/99999`).expect(404);
    });
  });
  describe('GET /drill-card/game/:gameId', () => {
    it('should return a 200 and all the drillcards of the game', async () => {
      const response = await request(app.getHttpServer())
        .get(`/drill-card/game/${testData.game.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThanOrEqual(
        testData.drillCards.length,
      );
    });
    it('should return a 404 if the game does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/drill-card/game/9999`)
        .expect(404);
    });
  });
  describe('POST /drill-card', () => {
    it('should return a 201 and create the drillcard correctly', async () => {
      await request(app.getHttpServer())
        .post(`/drill-card`)
        .send({ gameId: testData.game2.id })
        .expect(201);

      const drillCards = await prisma.drillCard.findMany({
        where: {
          gameId: testData.game2.id,
        },
      });

      expect(drillCards).toBeDefined();
      expect(drillCards.length).toBe(24);
    });
    it('should return a 404 if the game does not exist', async () => {
      await request(app.getHttpServer())
        .post(`/drill-card`)
        .send({ gameId: 9999 })
        .expect(404);
    });
  });
});
