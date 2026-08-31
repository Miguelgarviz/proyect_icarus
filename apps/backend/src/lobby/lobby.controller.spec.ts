import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';
import { Dificulty, Lobby, Player } from '../generated/prisma/client';
import { PlayerService } from '../player/player.service';

const request = require('supertest');

describe('LobbyController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;
  let testLobby: Lobby;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LobbyController],
      providers: [PlayerService, LobbyService, PrismaService],
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

  describe('GET /lobby/:id', () => {
    it('should return a 200 and the lobby by his id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/lobby/${testData.lobby3.id}`)
        .expect(200);

      expect(response.body.id).toBe(testData.lobby3.id);
      expect(response.body.dificulty).toBe(testData.lobby3.dificulty);
      expect(response.body.numPlayers).toBe(testData.lobby3.numPlayers);
    });
    it('should return a 404 if the lobby does not exist', async () => {
      await request(app.getHttpServer()).get(`/lobby/99999`).expect(404);
    });
  });
  describe('GET /lobby/players/:id', () => {
    it('should return a 200 and the players of the lobby', async () => {
      const response = await request(app.getHttpServer())
        .get(`/lobby/players/${testData.lobby1.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      const playerIds = response.body.map((p: Player) => p.id);
      expect(playerIds).toContain(testData.player1.id);
      expect(playerIds).toContain(testData.player2.id);
    });
    it('should return a 404 if the lobby does not exist', async () => {
      await request(app.getHttpServer()).get(`/lobby/players/9999`).expect(404);
    });
  });
  describe('POST /lobby', () => {
    it('should return a 201 and create the lobby correctly', async () => {
      const data = {
        dificulty: Dificulty.BEGINNER_I,
        numPlayers: 0,
      };

      const response = await request(app.getHttpServer())
        .post('/lobby')
        .send(data)
        .expect(201);

      const createdLobby = await prisma.lobby.findUniqueOrThrow({
        where: { id: response.body.id },
      });

      expect(createdLobby).toBeDefined();
      expect(createdLobby.dificulty).toBe(data.dificulty);
      expect(createdLobby.numPlayers).toBe(data.numPlayers);

      testLobby = createdLobby;
    });
  });
  describe('PUT /lobby/:id', () => {
    it('should return a 200 and update the lobby', async () => {
      const data = {
        dificulty: Dificulty.BEGINNER_II,
        numPlayers: 5,
      };

      const response = await request(app.getHttpServer())
        .put(`/lobby/${testData.lobby3.id}`)
        .send(data)
        .expect(200);

      const updatedLobby = await prisma.lobby.findUniqueOrThrow({
        where: { id: response.body.id },
      });

      expect(updatedLobby.dificulty).toBe(data.dificulty);
      expect(updatedLobby.numPlayers).toBe(data.numPlayers);
    });
    it('should return a 404 if the lobby does not exist', async () => {
      const data = {
        dificulty: Dificulty.BEGINNER_II,
        numPlayers: 5,
      };

      await request(app.getHttpServer())
        .put(`/lobby/9999`)
        .send(data)
        .expect(404);
    });
  });
  describe('PUT /lobby/:id/change-dificulty', () => {
    it('should return a 200 and the lobby with the dificulty updated', async () => {
      const response = await request(app.getHttpServer())
        .put(`/lobby/${testData.lobby1.id}/change-dificulty`)
        .send({ dificulty: Dificulty.BEGINNER_I })
        .expect(200);

      const updatedLobby = await prisma.lobby.findUniqueOrThrow({
        where: { id: response.body.id },
      });

      expect(updatedLobby.dificulty).toBe(Dificulty.BEGINNER_I);
    });
    it('should return a 404 if the lobby does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/lobby/9999/change-dificulty`)
        .send({ dificulty: Dificulty.BEGINNER_I })
        .expect(404);
    });
  });

  describe('PUT /lobby/:id/add-player', () => {
    it('should return a 200 and create a player in the lobby correctly', async () => {
      const data = {
        name: 'TestPlayer',
        color: '#ef4444',
      };

      const response = await request(app.getHttpServer())
        .put(`/lobby/${testLobby.id}/add-player`)
        .send(data)
        .expect(200);

      const updatedLobby = await prisma.lobby.findUniqueOrThrow({
        where: { id: response.body.id },
      });

      expect(updatedLobby.numPlayers).toBe(testLobby.numPlayers + 1);

      testLobby = updatedLobby;
    });
    it('should return a 404 if the lobby does not exist', async () => {
      const data = {
        name: 'TestPlayer',
        color: '#ef4444',
      };

      await request(app.getHttpServer())
        .put(`/lobby/99999/add-player`)
        .send(data)
        .expect(404);
    });
  });
  describe('PUT /lobby/:id/remove-player', () => {
    it('should return a 200 and remove the player by his id', async () => {
      const player = await prisma.player.findFirstOrThrow({
        where: {
          lobbyId: testLobby.id,
        },
      });

      const response = await request(app.getHttpServer())
        .put(`/lobby/${player.id}/remove-player`)
        .expect(200);

      const updatedLobby = await prisma.lobby.findUniqueOrThrow({
        where: { id: response.body.id },
      });

      expect(updatedLobby.numPlayers).toBe(testLobby.numPlayers - 1);

      const playerInDb = await prisma.player.findUnique({
        where: { id: player.id },
      });
      expect(playerInDb).toBeNull();

      testLobby = updatedLobby;
    });
    it('should return a 404 if the player does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/lobby/9999/remove-player`)
        .expect(404);
    });
  });
});
