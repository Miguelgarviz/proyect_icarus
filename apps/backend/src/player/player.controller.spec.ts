import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma/prisma.service';
import { seedTestDatabase, TestData, clearTestDatabase } from '../../test/test-data';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';
import { Player } from '../generated/prisma/client';

const request = require('supertest');

describe('PlayerController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        PlayerService,
        ShipService,
        StorageService,
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

  describe('GET /player', () => {
    it('should return a 200 and all the players', async () => {
        const response = await request(app.getHttpServer())
        .get('/player')
        .expect(200)

        expect(response.body).toBeDefined()
        expect(response.body.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('GET /player/:id', () => {
    it('should return a 200 and the player if exist', async () => {
        const response = await request(app.getHttpServer())
        .get(`/player/${testData.player2.id}`)
        .expect(200)

        expect(response.body.id).toBe(testData.player2.id)
        expect(response.body.shipId).toBe(testData.player2.shipId)
        expect(response.body.storageId).toBe(testData.player2.storageId)
        expect(response.body.movement).toBe(testData.player2.movement)
        expect(response.body.name).toBe(testData.player2.name)
        expect(response.body.color).toBe(testData.player2.color)
        expect(response.body.turnOrder).toBe(testData.player2.turnOrder)
        expect(response.body.initialHelp).toBe(testData.player2.initialHelp)
        expect(response.body.cleanedUp).toBe(testData.player2.cleanedUp)
        expect(response.body.isDead).toBe(testData.player2.isDead)
    })
    it('should return a 404 if the player does not exist', async () => {
        await request(app.getHttpServer())
        .get(`/player/999999`)
        .expect(404)
    })
    it('should handle a non-numeric id gracefully', async () => {
      // Number('abc') es NaN — Prisma recibirá NaN y fallará
      await request(app.getHttpServer())
        .get('/player/abc')
        .expect(400);
    });
  })

  describe('GET /lobby/:lobbyId', () => {
    it('should return a 200 and all the player from a lobby', async () => {
        const response = await request(app.getHttpServer())
        .get(`/player/lobby/${testData.lobby1.id}`)
        .expect(200)

        expect(response.body).toBeDefined()
        expect(response.body.length).toBeGreaterThanOrEqual(2)
        
        const playerIds = response.body.map((p:Player) => p.id);
        expect(playerIds).toContain(testData.player1.id);
        expect(playerIds).toContain(testData.player2.id);
    })
    it('should return a 404 if the lobby does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/player/lobby/99999`)
        .expect(404)
    })
  })

  describe('GET /:id/ship', () => {
    it('should return a 200 and the player ships', async () => {
        const response = await request(app.getHttpServer())
        .get(`/player/${testData.player2.id}/ship`)
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

    it('should return a 404 if the player or the ship does not exist', async () => {
        await request(app.getHttpServer())
        .get(`/player/9999/ship`)
        .expect(404)

        await request(app.getHttpServer())
        .get(`/player/${testData.player4.id}/ship`)
        .expect(404)

    })
  })

  describe('GET /player/:id/storage', () => {
    it('should return a 200 and the players storage', async () => {
        const response = await request(app.getHttpServer())
        .get(`/player/${testData.player3.id}/storage`)
        .expect(200)

        expect(response.body.id).toBe(testData.storage3.id)
        expect(response.body.green).toBe(testData.storage3.green)
        expect(response.body.red).toBe(testData.storage3.red)
        expect(response.body.yellow).toBe(testData.storage3.yellow)
    })
    it('should return a 404 if the player or the storage does not exist', async () => {
        await request(app.getHttpServer())
        .get(`/player/9999/storage`)
        .expect(404)

        await request(app.getHttpServer())
        .get(`/player/${testData.player4.id}/storage`)
        .expect(404)
    })
  })

  describe('POST /player/:lobbyId/ship', () => {
    it('should return a 201 and create ships for all players in the lobby', async () => {
        await request(app.getHttpServer())
        .post(`/player/${testData.lobby3.id}/ship`)
        .expect(201)
    })
    it('should return a 404 if the lobby does not exist', async () => {
      await request(app.getHttpServer())
        .post(`/player/9999/ship`)
        .expect(404)
    })
  })

  describe('POST /player/:lobbyId/storage', () => {
    it('should return a 201 and create storages for all players in the lobby', async () => {
      await request(app.getHttpServer())
        .post(`/player/${testData.lobby3.id}/storage`)
        .expect(201)
    })
    it('should return a 404 if the storage does not exist', async () => {
      await request(app.getHttpServer())
        .post(`/player/9999/storage`)
        .expect(404)
    })
  })

  describe('PUT /player/:id', () => {
    it('should return a 200 after updating the player', async () => {
      const data = {
        movement: 3,
        name: 'TestPlayer3Updated',
        color: '#b91010'
      }
      await request(app.getHttpServer())
      .put(`/player/${testData.player3.id}`)
      .send(data)
      .expect(200)

      const player = await prisma.player.findUniqueOrThrow({where: {id: testData.player3.id } })

      expect(player.movement).toBe(data.movement)
      expect(player.name).toBe(data.name)
      expect(player.color).toBe(data.color)
    })
    it('should return a 404 if the player does not exist', async () => {
      const data = {
        movement: 3,
        name: 'TestPlayer3Updated',
        color: '#b91010'
      }
      await request(app.getHttpServer())
      .put(`/player/9999`)
      .send(data)
      .expect(404)
    })
  })

  describe('DELETE /player/:id', () => {
    it('should return a 200 and delete the existing player', async () => {
      const player = await prisma.player.create({
        data:{
          movement: 3,
          name: 'TestPlayerDelete',
          color: '#1900ff',
          turnOrder: 1,
        
          lobby: {
            connect: {
              id: testData.lobby3.id
            }
          }
        }
      })

      await request(app.getHttpServer())
      .delete(`/player/${player.id}`)
      .expect(200)

      const playerInDb = await prisma.player.findUnique({ where: { id: player.id } });
      expect(playerInDb).toBeNull();
    })
    it('should return a 404 if the player does not exist', async () => {
      await request(app.getHttpServer())
      .delete(`/player/9999`)
      .expect(404)
    })
  })
});