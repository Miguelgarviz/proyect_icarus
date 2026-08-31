import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { LobbyService } from '../lobby/lobby.service';
import { ShipService } from '../ship/ship.service';
import { StorageService } from '../storage/storage.service';
import { TileService } from '../tile/tile.service';
import { PlayerService } from '../player/player.service';
import { CardService } from '../card/card.service';
import { StoreService } from '../store/store.service';
import { DrillCardService } from '../drill-card/drill-card.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaExceptionFilter } from '../prisma/prisma-exception.filter';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';
import { CardType } from '../generated/prisma/client';

const request = require('supertest');

describe('GameController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testData: TestData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        GameService,
        LobbyService,
        ShipService,
        StorageService,
        TileService,
        PlayerService,
        CardService,
        StoreService,
        DrillCardService,
        PrismaService,
      ],
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

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id', () => {
    it('should return 200 and the game when it exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}`)
        .expect(200);

      expect(response.body.id).toBe(testData.game.id);
      expect(response.body.lobbyId).toBe(testData.lobby1.id);
      expect(response.body.actualPlayerId).toBe(testData.player1.id);
      expect(response.body.storeId).toBe(testData.store1.id);
      expect(response.body.round).toBe(0);
      expect(response.body.supernovaLvL).toBe(0);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer()).get('/game/999999').expect(404);
    });

    it('should return 400 for a non-numeric id', async () => {
      await request(app.getHttpServer()).get('/game/abc').expect(400);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /game
  // ─────────────────────────────────────────────────────────────────────────────

  describe('POST /game', () => {
    it('should return 201 and the created game', async () => {
      const response = await request(app.getHttpServer())
        .post('/game')
        .send({
          lobby: testData.lobby2.id,
          actualPlayer: testData.player3.id,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.lobbyId).toBe(testData.lobby2.id);
      expect(response.body.actualPlayerId).toBe(testData.player3.id);

      // Limpiamos el game creado
      await prisma.game.delete({ where: { id: response.body.id } });
    });

    it('should return 400 if lobby does not exist', async () => {
      await request(app.getHttpServer())
        .post('/game')
        .send({
          lobby: 999999,
          actualPlayer: testData.player3.id,
        })
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /game/:id/create-store
  // ─────────────────────────────────────────────────────────────────────────────

  describe('POST /game/:id/create-store', () => {
    it('should return 201 and create a store with 18 cards for a multi-player game', async () => {
      // game tiene lobby1 con numPlayers=2
      const response = await request(app.getHttpServer())
        .post(`/game/${testData.game.id}/create-store`)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.numCards).toBe(18);

      // Verificamos que se crearon cartas
      const cards = await prisma.card.findMany({
        where: { storeId: response.body.id },
      });
      expect(cards.length).toBeGreaterThan(0);

      // Verificamos que 3 cartas están en el storefront
      const storefrontCards = cards.filter((c) => c.inFrontStore);
      expect(storefrontCards.length).toBe(3);

      // Limpiamos el store extra creado
      await prisma.card.deleteMany({ where: { storeId: response.body.id } });
      await prisma.store.delete({ where: { id: response.body.id } });

      await prisma.game.update({
        data: {
          storeId: testData.store1.id,
        },
        where: {
          id: testData.game.id,
        },
      });
    });

    it('should return 201 and create a store with 16 cards for a single-player game', async () => {
      // game2 tiene lobby3 con numPlayers=1
      const response = await request(app.getHttpServer())
        .post(`/game/${testData.game2.id}/create-store`)
        .expect(201);

      expect(response.body.numCards).toBe(16);

      // Limpiamos
      await prisma.card.deleteMany({ where: { storeId: response.body.id } });
      await prisma.store.delete({ where: { id: response.body.id } });
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .post('/game/999999/create-store')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/players
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/players', () => {
    it('should return 200 and all players from the game lobby', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/players`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      const playerIds = response.body.map((p: any) => p.id);
      expect(playerIds).toContain(testData.player1.id);
      expect(playerIds).toContain(testData.player2.id);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .get('/game/999999/players')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/ships
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/ships', () => {
    it('should return 200 and all ships from players in the game', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/ships`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      const shipIds = response.body.map((s: any) => s.id);
      expect(shipIds).toContain(testData.ship1.id);
      expect(shipIds).toContain(testData.ship2.id);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer()).get('/game/999999/ships').expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/store
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/store', () => {
    it('should return 200 and the store when the game has one', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/store`)
        .expect(200);

      expect(response.body.id).toBe(testData.store1.id);
      expect(response.body.numCards).toBe(testData.store1.numCards);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer()).get('/game/999999/store').expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/storages
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/storages', () => {
    it('should return 200 and all storages from players in the game', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/storages`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);

      const storageIds = response.body.map((s: any) => s.id);
      expect(storageIds).toContain(testData.storage1.id);
      expect(storageIds).toContain(testData.storage2.id);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .get('/game/999999/storages')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/current-player
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/current-player', () => {
    it('should return 200 and the current player', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/current-player`)
        .expect(200);

      expect(response.body.id).toBe(testData.player1.id);
      expect(response.body.name).toBe(testData.player1.name);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .get('/game/999999/current-player')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/get-goal
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/get-goal', () => {
    it('should return 200 and the difficulty of the game lobby', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/get-goal`)
        .expect(200);

      expect(response.body.difficulty).toBeDefined();
      expect(response.body.difficulty).toBe(
        testData.lobby1.dificulty.toString().toLowerCase(),
      );
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .get('/game/999999/get-goal')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/goal
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/goal', () => {
    it('should return 200 and true when the player has achieved the goal', async () => {
      // lobby1 es EASY_II: requiere red>=2, green>=2
      // storage1 tiene green:4, red:1 — no cumple
      // Actualizamos storage1 para que cumpla el objetivo
      await prisma.storage.update({
        where: { id: testData.storage1.id },
        data: { green: 2, red: 2, yellow: 1 },
      });

      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/goal`)
        .expect(200);
      expect(response.text).toBe('true');

      // Restauramos
      await prisma.storage.update({
        where: { id: testData.storage1.id },
        data: { green: 4, red: 1, yellow: 0 },
      });
    });

    it('should return 200 and false when the player has not achieved the goal', async () => {
      // storage1 tiene green:4, red:1 — EASY_II requiere red>=2, no cumple
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/goal`)
        .expect(200);

      expect(response.text).toBe('false');
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer()).get('/game/999999/goal').expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /game/:id/move-player
  // ─────────────────────────────────────────────────────────────────────────────

  describe('PUT /game/:id/move-player', () => {
    it('should return 200 when moving the current player to a valid tile', async () => {
      // player1 está en void_2 (positionX:2, positionY:0) con movement:4
      // Movemos a void_3 (positionX:3, positionY:0) — distancia 1
      await request(app.getHttpServer())
        .put(`/game/${testData.game.id}/move-player`)
        .send({ externalId: 'void_3' })
        .expect(200);

      // Verificamos que la nave se movió
      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.positionX).toBe(3);
      expect(updatedShip.positionY).toBe(0);
      expect(updatedShip.externalId).toBe('void_3');

      // Restauramos la nave a su posición original
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { positionX: 2, positionY: 0, externalId: 'void_2' },
      });
      await prisma.player.update({
        where: { id: testData.player1.id },
        data: { movement: 4 },
      });
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .put('/game/999999/move-player')
        .send({ externalId: 'void_3' })
        .expect(404);
    });

    it('should return 404 when the externalId does not exist', async () => {
      await request(app.getHttpServer())
        .put(`/game/${testData.game.id}/move-player`)
        .send({ externalId: 'non_existent_tile' })
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /game/:id/initial-help
  // ─────────────────────────────────────────────────────────────────────────────

  describe('PUT /game/:id/initial-help', () => {
    it('should return 200 and give initial help when conditions are met', async () => {
      // Condiciones: storage vacío, drill=0, initialHelp=true
      await prisma.storage.update({
        where: { id: testData.storage1.id },
        data: { green: 0, red: 0, yellow: 0 },
      });
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { drill: 0 },
      });
      await prisma.player.update({
        where: { id: testData.player1.id },
        data: { initialHelp: true },
      });

      await request(app.getHttpServer())
        .put(`/game/${testData.game.id}/initial-help`)
        .expect(200);

      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      expect(updatedStorage.green).toBe(3);

      const updatedPlayer = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      expect(updatedPlayer.initialHelp).toBe(false);

      // Restauramos
      await prisma.storage.update({
        where: { id: testData.storage1.id },
        data: { green: 4, red: 1, yellow: 1 },
      });
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { drill: 7 },
      });
    });

    it('should return 200 but not give help when conditions are not met', async () => {
      // storage1 ya tiene recursos — no debe dar ayuda
      const storageBefore = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });

      await request(app.getHttpServer())
        .put(`/game/${testData.game.id}/initial-help`)
        .expect(200);

      const storageAfter = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.storage1.id },
      });
      expect(storageAfter.green).toBe(storageBefore.green);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .put('/game/999999/initial-help')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /game/:id/adjacent-players
  // ─────────────────────────────────────────────────────────────────────────────

  describe('GET /game/:id/adjacent-players', () => {
    it('should return 200 and an array of adjacent players', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/adjacent-players`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not include the current player in adjacent players', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/adjacent-players`)
        .expect(200);

      const playerIds = response.body.map((p: any) => p.id);
      expect(playerIds).not.toContain(testData.player1.id);
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .get('/game/999999/adjacent-players')
        .expect(404);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PUT /game/:id/use-card
  // ─────────────────────────────────────────────────────────────────────────────

  describe('PUT /game/:id/use-card', () => {
    it('should return 200 and apply BACKUP_POWER card', async () => {
      // player1 tiene una carta ENHANCED_SCANNER asignada en el seed
      // Creamos una carta BACKUP_POWER para player1
      const card = await prisma.card.create({
        data: {
          type: CardType.BACKUP_POWER,
          cost: 1,
          playerId: testData.player1.id,
        },
      });

      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { shield: 3 },
      });

      await request(app.getHttpServer())
        .put(`/game/${testData.game.id}/use-card`)
        .send({ cardId: card.id, effect: '' })
        .expect(200);

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship1.id },
      });
      expect(updatedShip.shield).toBe(10);

      const updatedCard = await prisma.card.findUniqueOrThrow({
        where: { id: card.id },
      });
      expect(updatedCard.isDiscarded).toBe(true);

      // Restauramos
      await prisma.ship.update({
        where: { id: testData.ship1.id },
        data: { shield: 7 },
      });
    });

    it('should return 200 but not apply card if player is dead', async () => {
      const card = await prisma.card.create({
        data: {
          type: CardType.BACKUP_POWER,
          cost: 1,
          playerId: testData.player1.id,
        },
      });

      await prisma.player.update({
        where: { id: testData.player1.id },
        data: { isDead: true },
      });

      await request(app.getHttpServer())
        .put(`/game/${testData.game.id}/use-card`)
        .send({ cardId: card.id, effect: '' })
        .expect(200);

      // La carta no debe haberse descartado
      const updatedCard = await prisma.card.findUniqueOrThrow({
        where: { id: card.id },
      });
      expect(updatedCard.isDiscarded).toBe(false);

      // Restauramos
      await prisma.player.update({
        where: { id: testData.player1.id },
        data: { isDead: false },
      });
      await prisma.card.delete({ where: { id: card.id } });
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .put('/game/999999/use-card')
        .send({ cardId: 1, effect: '' })
        .expect(404);
    });
  });

  describe('GET /game/:id/get-resource-cards', () => {
    it('should return 200 and an array of 3 drill cards', async () => {
      const response = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/get-resource-cards`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Verificamos que cada elemento es una DrillCard válida
      response.body.forEach((card: any) => {
        expect(card.id).toBeDefined();
        expect(card.isSupernovaCard).toBe(false);
        expect(card.gameId).toBe(testData.game.id);
      });
    });

    it('should return cards deterministas con la misma seed', async () => {
      const response1 = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/get-resource-cards`)
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get(`/game/${testData.game.id}/get-resource-cards`)
        .expect(200);

      // Con el mismo estado en la BD, la seed es la misma y el resultado debe ser igual
      expect(response1.body.map((c: any) => c.id)).toEqual(
        response2.body.map((c: any) => c.id),
      );
    });

    it('should return 404 when the game does not exist', async () => {
      await request(app.getHttpServer())
        .get('/game/999999/get-resource-cards')
        .expect(404);
    });
  });
});
