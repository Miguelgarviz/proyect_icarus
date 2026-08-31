import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ShipController } from './ship.controller';
import { ShipService } from './ship.service';
import { PrismaService } from '../prisma/prisma.service';
import { seedTestDatabase, TestData, clearTestDatabase } from '../../test/test-data';
import { Tile, TileType } from '../generated/prisma/client';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';

const request = require('supertest');

describe('ShipController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipController],
      providers: [
        ShipService,
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

  describe('GET /ship', () => {
    it('should return a 200 and all the ships', async () => {
        const response = await request(app.getHttpServer())
        .get(`/ship`)
        .expect(200)

        expect(response.body.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('GET /ship/:id', () => {
    it('should return a 200 and the ship if it exist', async () => {
        const response = await request(app.getHttpServer())
        .get(`/ship/${testData.ship2.id}`)
        .expect(200)

        expect(response.body.id).toBe(testData.ship2.id)
        expect(response.body.shield).toBe(testData.ship2.shield)
        expect(response.body.drill).toBe(testData.ship2.drill)
        expect(response.body.engine).toBe(testData.ship2.engine)
        expect(response.body.positionX).toBe(testData.ship2.positionX)
        expect(response.body.positionY).toBe(testData.ship2.positionY)
        expect(response.body.externalId).toBe(testData.ship2.externalId)
        expect(response.body.engineUpgraded).toBe(testData.ship2.engineUpgraded)
        expect(response.body.canDrillDeeper).toBe(testData.ship2.canDrillDeeper)
    })
    it('should return a 404 if the ship does not exist', async () => {
        await request(app.getHttpServer())
        .get(`/ship/99999`)
        .expect(404)
    })
    it('should handle a non-numeric id gracefully', async () => {
      // Number('abc') es NaN — Prisma recibirá NaN y fallará
      await request(app.getHttpServer())
        .get('/ship/abc')
        .expect(400);
    });
  })
  
});