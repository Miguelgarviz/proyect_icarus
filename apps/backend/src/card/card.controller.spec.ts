import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';
import { Card, CardType } from '../generated/prisma/client';
import { DrillCardService } from '../drill-card/drill-card.service';

const request = require('supertest');

describe('CardController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;
  let testCard: Card;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [DrillCardService, CardService, PrismaService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await app.close();
  });

  describe('POST /card', () => {
    it('should return a 201 and create a card correctly', async () => {
      const data = {
        cost: 1,
        type: CardType.BACKUP_POWER,
        storeId: testData.store2.id,
      };

      const response = await request(app.getHttpServer())
        .post('/card')
        .send(data)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.cost).toBe(data.cost);
      expect(response.body.type).toBe(data.type);
      expect(response.body.inFrontStore).toBe(false);
      expect(response.body.isDiscarded).toBe(false);
      expect(response.body.storeId).toBe(data.storeId);

      const createdCard = await prisma.card.findUniqueOrThrow({
        where: { id: response.body.id },
      });

      expect(createdCard).toBeDefined();

      testCard = createdCard;
    });
  });
  describe('GET /card/:id', () => {
    it('should return a 200 and the card by his id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/card/${testCard.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.cost).toBe(testCard.cost);
      expect(response.body.type).toBe(testCard.type);
      expect(response.body.inFrontStore).toBe(false);
      expect(response.body.isDiscarded).toBe(false);
      expect(response.body.storeId).toBe(testCard.storeId);
    });
    it('should return a 404 if the card does not exist', async () => {
      await request(app.getHttpServer()).get(`/card/9999`).expect(404);
    });
  });
  describe('GET /card/player-cards/:playerId ', () => {
    it('should return a 200 and the cards of the player correctly', async () => {
      const response = await request(app.getHttpServer())
        .get(`/card/player-cards/${testData.player1.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });
    it('should return a 404 if the player does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/card/player-cards/9999`)
        .expect(404);
    });
  });
});
