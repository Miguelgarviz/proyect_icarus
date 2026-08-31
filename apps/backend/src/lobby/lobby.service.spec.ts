import { Test, TestingModule } from '@nestjs/testing';
import { LobbyService } from './lobby.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Dificulty, Lobby } from '../generated/prisma/client';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';

describe('LobbyService', () => {
  let service: LobbyService;
  let prisma: PrismaService;
  let testData: TestData;

  let createdLobby: Lobby;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LobbyService, PrismaService],
    }).compile();

    service = module.get<LobbyService>(LobbyService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('LobbyService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createLobby', () => {
    it('should create a new lobby', async () => {
      const data: Prisma.LobbyCreateInput = {
        dificulty: Dificulty.EASY_I,
        numPlayers: 2,
      };

      const result = await service.createLobby(data);

      expect(result).toBeDefined();
      expect(result.dificulty).toBe(Dificulty.EASY_I);
      expect(result.numPlayers).toBe(2);

      // Verificamos que realmente existe en la BD
      const lobbyInDb = await prisma.lobby.findUnique({
        where: { id: result.id },
      });
      expect(lobbyInDb).not.toBeNull();

      createdLobby = result;
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getLobby', () => {
    it('should get a lobby by its ID', async () => {
      const result = await service.getLobby({ id: testData.lobby1.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.lobby1.id);
      expect(result.dificulty).toBe(testData.lobby1.dificulty);
      expect(result.numPlayers).toBe(testData.lobby1.numPlayers);
    });

    it('should throw P2025 if the lobby does not exist', async () => {
      await expect(service.getLobby({ id: 999999 })).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // updateLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('updateLobby', () => {
    it('should update a lobby with the provided data', async () => {
      const updateData = { numPlayers: 4 };

      const result = await service.updateLobby({
        where: { id: createdLobby.id },
        data: updateData,
      });

      expect(result).toBeDefined();
      expect(result.numPlayers).toBe(4);

      createdLobby = result;
    });

    it('should throw P2025 if the lobby does not exist', async () => {
      await expect(
        service.updateLobby({ where: { id: 999999 }, data: { numPlayers: 4 } }),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // changeLobbyDificulty
  // ─────────────────────────────────────────────────────────────────────────────

  describe('changeLobbyDificulty', () => {
    it('should change the difficulty of a lobby', async () => {
      const result = await service.changeLobbyDificulty({
        where: { id: createdLobby.id },
        data: { dificulty: Dificulty.HARD_I },
      });

      expect(result).toBeDefined();
      expect(result.dificulty).toBe(Dificulty.HARD_I);

      // Verificamos en la BD
      const lobbyInDb = await prisma.lobby.findUniqueOrThrow({
        where: { id: createdLobby.id },
      });
      expect(lobbyInDb.dificulty).toBe(Dificulty.HARD_I);

      createdLobby = result;
    });

    it('should throw P2025 if the lobby does not exist', async () => {
      await expect(
        service.changeLobbyDificulty({
          where: { id: 999999 },
          data: { dificulty: Dificulty.EASY_I },
        }),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getPlayersInLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getPlayersInLobby', () => {
    it('should return all players in a lobby ordered by turnOrder', async () => {
      const result = await service.getPlayersInLobby({
        id: testData.lobby1.id,
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(2);

      // Verificamos que vienen ordenados por turnOrder
      for (let i = 1; i < result.length; i++) {
        expect(result[i].turnOrder).toBeGreaterThanOrEqual(
          result[i - 1].turnOrder,
        );
      }

      // Verificamos que los jugadores del seed están presentes
      const playerIds = result.map((p) => p.id);
      expect(playerIds).toContain(testData.player1.id);
      expect(playerIds).toContain(testData.player2.id);
    });

    it('should return an empty array if the lobby has no players', async () => {
      const result = await service.getPlayersInLobby({ id: createdLobby.id });

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getRemainingPlayers
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getRemainingPlayers', () => {
    it('should return players where cleanedUp is false', async () => {
      const result = await service.getRemainingPlayers({
        id: testData.lobby1.id,
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((p) => expect(p.cleanedUp).toBe(false));
    });

    it('should not return players where cleanedUp is true', async () => {
      // Marcamos player2 como limpiado
      await prisma.player.update({
        where: { id: testData.player2.id },
        data: { cleanedUp: true },
      });

      const result = await service.getRemainingPlayers({
        id: testData.lobby1.id,
      });
      const playerIds = result.map((p) => p.id);

      expect(playerIds).not.toContain(testData.player2.id);

      // Restauramos el estado
      await prisma.player.update({
        where: { id: testData.player2.id },
        data: { cleanedUp: false },
      });
    });

    it('should return players ordered by turnOrder', async () => {
      const result = await service.getRemainingPlayers({
        id: testData.lobby1.id,
      });

      for (let i = 1; i < result.length; i++) {
        expect(result[i].turnOrder).toBeGreaterThanOrEqual(
          result[i - 1].turnOrder,
        );
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // addPlayerToLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('addPlayerToLobby', () => {
    it('should connect a player to the lobby and increment numPlayers', async () => {
      const lobbyBefore = await prisma.lobby.findUniqueOrThrow({
        where: { id: createdLobby.id },
      });

      const result = await service.addPlayerToLobby({
        where: { id: createdLobby.id },
        data: { playerId: testData.player1.id },
      });

      expect(result).toBeDefined();
      expect(result.numPlayers).toBe(lobbyBefore.numPlayers + 1);

      // Verificamos que el player está conectado al lobby
      const players = await prisma.player.findMany({
        where: { lobbyId: createdLobby.id },
      });
      const playerIds = players.map((p) => p.id);
      expect(playerIds).toContain(testData.player1.id);

      createdLobby = result;
    });

    it('should throw P2025 if the lobby does not exist', async () => {
      await expect(
        service.addPlayerToLobby({
          where: { id: 999999 },
          data: { playerId: testData.player1.id },
        }),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // removePlayerFromLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('removePlayerFromLobby', () => {
    it('should disconnect a player from the lobby and decrement numPlayers', async () => {
      const lobbyBefore = await prisma.lobby.findUniqueOrThrow({
        where: { id: createdLobby.id },
      });

      const result = await service.removePlayerFromLobby({
        where: { id: createdLobby.id },
        data: { playerId: testData.player1.id },
      });

      expect(result).toBeDefined();
      expect(result.numPlayers).toBe(lobbyBefore.numPlayers - 1);

      // Verificamos que el player ya no está conectado al lobby
      const players = await prisma.player.findMany({
        where: { lobbyId: createdLobby.id },
      });
      const playerIds = players.map((p) => p.id);
      expect(playerIds).not.toContain(testData.player1.id);

      createdLobby = result;
    });

    it('should throw P2025 if the lobby does not exist', async () => {
      await expect(
        service.removePlayerFromLobby({
          where: { id: 999999 },
          data: { playerId: testData.player1.id },
        }),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getLobbieFromPlayer
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getLobbieFromPlayer', () => {
    it('should return the lobby associated with a player', async () => {
      const result = await service.getLobbieFromPlayer(testData.player2.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.lobby1.id);
    });

    it('should throw P2025 if the player does not exist', async () => {
      await expect(service.getLobbieFromPlayer(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getGoalFromLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getGoalFromLobby', () => {
    it('should return the difficulty of the lobby', async () => {
      const result = await service.getGoalFromLobby(testData.lobby1.id);

      expect(result).toBeDefined();
      expect(result).toBe(testData.lobby1.dificulty);
    });

    it('should throw P2025 if the lobby does not exist', async () => {
      await expect(service.getGoalFromLobby(999999)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });
});
