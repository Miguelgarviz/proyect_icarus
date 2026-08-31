import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { CardService } from '../card/card.service';
import { PrismaService } from '../prisma/prisma.service';
import { TileService } from '../tile/tile.service';
import { seedTestDatabase, TestData, clearTestDatabase } from '../../test/test-data';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';

const request = require('supertest');

describe('StoreController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        StoreService,
        CardService,
        TileService,
        PrismaService,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new PrismaExceptionFilter())
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await app.close();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /store/:id
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /store/:id', () => {
    it('should return 200 and the store when it exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/store/${testData.store1.id}`)
        .expect(200);

      expect(response.body.id).toBe(testData.store1.id);
      expect(response.body.numCards).toBe(testData.store1.numCards);
    });

    it('should return 404 when the store does not exist', async () => {
      await request(app.getHttpServer())
        .get('/store/999999')
        .expect(404);
    });

    it('should handle a non-numeric id gracefully', async () => {
      // Number('abc') es NaN — Prisma recibirá NaN y fallará
      await request(app.getHttpServer())
        .get('/store/abc')
        .expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /store/:id/cards
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /store/:id/cards', () => {
    it('should return 200 and the list of cards for the store', async () => {
      const response = await request(app.getHttpServer())
        .get(`/store/${testData.store1.id}/cards`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((card: any) => {
        expect(card.storeId).toBe(testData.store1.id);
        expect(card.inFrontStore).toBe(false);
        expect(card.isDiscarded).toBe(false);
      });
    });

    it('should return 200 and an empty array if the store has no available cards', async () => {
      // Creamos un store vacío (sin cartas)
      const emptyStore = await prisma.store.create({ data: { numCards: 0 } });

      const response = await request(app.getHttpServer())
        .get(`/store/${emptyStore.id}/cards`)
        .expect(200);

      expect(response.body).toEqual([]);

      // Limpiamos
      await prisma.store.delete({ where: { id: emptyStore.id } });
    });

    it('should not return cards that are in the storefront', async () => {
      // Ponemos todas las cartas del store en el storefront
      await prisma.card.updateMany({
        where: { storeId: testData.store1.id },
        data: { inFrontStore: true },
      });

      const response = await request(app.getHttpServer())
        .get(`/store/${testData.store1.id}/cards`)
        .expect(200);

      expect(response.body).toEqual([]);

      // Restauramos
      await prisma.card.updateMany({
        where: { storeId: testData.store1.id },
        data: { inFrontStore: false },
      });
    });

    it('should not return discarded cards', async () => {
      // Descartamos todas las cartas del store
      await prisma.card.updateMany({
        where: { storeId: testData.store1.id },
        data: { isDiscarded: true },
      });

      const response = await request(app.getHttpServer())
        .get(`/store/${testData.store1.id}/cards`)
        .expect(200);

      expect(response.body).toEqual([]);

      // Restauramos
      await prisma.card.updateMany({
        where: { storeId: testData.store1.id },
        data: { isDiscarded: false },
      });
    });

    it('should return a 404 if the store does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/store/9999/cards`)
        .expect(404);
    })
  });
});