import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { PrismaService } from '../prisma/prisma.service';
import { Player, Prisma } from '../generated/prisma/client';
import { seedTestDatabase, TestData, clearTestDatabase } from '../../test/test-data';

describe('PlayerService', () => {
  let service: PlayerService;
  let prisma: PrismaService;
  let testData: TestData;

  let createdPlayer: Player;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        PrismaService,
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
    prisma = module.get<PrismaService>(PrismaService);

    testData = await seedTestDatabase(prisma);
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('PlayerService should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // createPlayer
  // ─────────────────────────────────────────────────────────────────────────────

  describe('createPlayer', () => {
    it('should create a new player associated to a lobby, ship and storage', async () => {
      const newShip = await prisma.ship.create({
        data: { externalId: 'ship_new_player', positionX: 0, positionY: 0, engine: 5, shield: 5, drill: 5 },
      });
      const newStorage = await prisma.storage.create({
        data: { green: 0, red: 0, yellow: 0 },
      });

      const data: Prisma.PlayerCreateInput = {
        name: 'NewPlayer',
        color: '#123456',
        turnOrder: 99,
        movement: 5,
        lobby: { connect: { id: testData.lobby1.id } },
        ship: { connect: { id: newShip.id } },
        storage: { connect: { id: newStorage.id } },
      };

      const result = await service.createPlayer(data);

      expect(result).toBeDefined();
      expect(result.name).toBe('NewPlayer');
      expect(result.color).toBe('#123456');
      expect(result.turnOrder).toBe(99);
      expect(result.movement).toBe(5);
      expect(result.lobbyId).toBe(testData.lobby1.id);
      expect(result.shipId).toBe(newShip.id);
      expect(result.storageId).toBe(newStorage.id);

      // Verificamos que existe en la BD
      const playerInDb = await prisma.player.findUnique({ where: { id: result.id } });
      expect(playerInDb).not.toBeNull();

      createdPlayer = result;
    });

    it('should throw if the lobby does not exist', async () => {
      const newShip = await prisma.ship.create({
        data: { externalId: 'ship_bad_lobby', positionX: 0, positionY: 0, engine: 5, shield: 5, drill: 5 },
      });
      const newStorage = await prisma.storage.create({
        data: { green: 0, red: 0, yellow: 0 },
      });

      await expect(
        service.createPlayer({
          name: 'BadPlayer',
          color: '#000000',
          turnOrder: 0,
          movement: 5,
          lobby: { connect: { id: 999999 } },
          ship: { connect: { id: newShip.id } },
          storage: { connect: { id: newStorage.id } },
        }),
      ).rejects.toMatchObject({ code: 'P2025' });

      // Limpiamos los recursos huérfanos
      await prisma.ship.delete({ where: { id: newShip.id } });
      await prisma.storage.delete({ where: { id: newStorage.id } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getPlayer
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getPlayer', () => {
    it('should return a player by its ID', async () => {
      const result = await service.getPlayer({ id: testData.player1.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.player1.id);
      expect(result.name).toBe(testData.player1.name);
      expect(result.color).toBe(testData.player1.color);
    });

    it('should throw P2025 if the player does not exist', async () => {
      await expect(service.getPlayer({ id: 999999 })).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getPlayers
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getPlayers', () => {
    it('should return all players when no filters are applied', async () => {
      const result = await service.getPlayers({});

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThanOrEqual(3);

      const playerIds = result.map(p => p.id);
      expect(playerIds).toContain(testData.player1.id);
      expect(playerIds).toContain(testData.player2.id);
      expect(playerIds).toContain(testData.player3.id);
    });

    it('should order players by turnOrder ascending', async () => {
      const result = await service.getPlayers({
        where: { lobbyId: testData.lobby1.id },
        orderBy: { turnOrder: 'asc' },
      });

      for (let i = 1; i < result.length; i++) {
        expect(result[i].turnOrder).toBeGreaterThanOrEqual(result[i - 1].turnOrder);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // updatePlayer
  // ─────────────────────────────────────────────────────────────────────────────

  describe('updatePlayer', () => {
    it('should update the provided fields of a player', async () => {
      const result = await service.updatePlayer({
        where: { id: createdPlayer.id },
        data: { name: 'UpdatedPlayer', movement: 10 },
      });

      expect(result.name).toBe('UpdatedPlayer');
      expect(result.movement).toBe(10);

      // Verificamos en la BD
      const playerInDb = await prisma.player.findUniqueOrThrow({ where: { id: createdPlayer.id } });
      expect(playerInDb.name).toBe('UpdatedPlayer');
      expect(playerInDb.movement).toBe(10);

      createdPlayer = result;
    });

    it('should throw P2025 if the player does not exist', async () => {
      await expect(
        service.updatePlayer({ where: { id: 999999 }, data: { name: 'X' } }),
      ).rejects.toMatchObject({ code: 'P2025' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getPlayersInLobby
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getPlayersInLobby', () => {
    it('should return all players in a lobby', async () => {
      const result = await service.getPlayersInLobby(testData.lobby2.id);

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      result.forEach(p => expect(p.lobbyId).toBe(testData.lobby2.id));

      const playerIds = result.map(p => p.id);
      expect(playerIds).toContain(testData.player3.id);
    });

    it('should return an empty array if the lobby has no players', async () => {
      const emptyLobby = await prisma.lobby.create({
        data: { dificulty: 'BEGINNER_I', numPlayers: 0 },
      });

      const result = await service.getPlayersInLobby(emptyLobby.id);
      expect(result).toEqual([]);

      await prisma.lobby.delete({ where: { id: emptyLobby.id } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // getShipFromPlayer
  // ─────────────────────────────────────────────────────────────────────────────

  describe('getShipFromPlayer', () => {
    it('should return the ship associated to a player', async () => {
      const result = await service.getShipFromPlayer(testData.player1);

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.ship1.id);
      expect(result.externalId).toBe(testData.ship1.externalId);
    });

    it('should throw P2025 if the ship does not exist', async () => {
      const playerWithNoShip = { ...testData.player1, shipId: 999999 };

      await expect(service.getShipFromPlayer(playerWithNoShip)).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // setPlayerDeath
  // ─────────────────────────────────────────────────────────────────────────────

  describe('setPlayerDeath', () => {
    it('should mark the player as dead', async () => {
      await service.setPlayerDeath(createdPlayer);

      const updatedPlayer = await prisma.player.findUniqueOrThrow({ where: { id: createdPlayer.id } });
      expect(updatedPlayer.isDead).toBe(true);
    });

    it('should set ship engine and drill to 0', async () => {
      await service.setPlayerDeath(testData.player2);

      const updatedShip = await prisma.ship.findUniqueOrThrow({ where: { id: testData.ship2.id } });
      expect(updatedShip.engine).toBe(0);
      expect(updatedShip.drill).toBe(0);
    });

    it('should clear all storage resources', async () => {
      const updatedStorage = await prisma.storage.findUniqueOrThrow({ where: { id: testData.storage2.id } });
      expect(updatedStorage.green).toBe(0);
      expect(updatedStorage.red).toBe(0);
      expect(updatedStorage.yellow).toBe(0);
    });

    it('should unassign all cards from the player', async () => {
      // Asignamos una carta al player antes de matarlo
      const card = await prisma.card.create({
        data: {
          type: 'BACKUP_POWER',
          cost: 1,
          player: { connect: { id: createdPlayer.id } },
        },
      });

      // Volvemos a ejecutar setPlayerDeath (ya está muerto pero las cards se limpian igual)
      await service.setPlayerDeath(createdPlayer);

      const updatedCard = await prisma.card.findUniqueOrThrow({ where: { id: card.id } });
      expect(updatedCard.playerId).toBeNull();

      // Limpiamos la carta
      await prisma.card.delete({ where: { id: card.id } });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // cleanPlayerShip
  // ─────────────────────────────────────────────────────────────────────────────

  describe('cleanPlayerShip', () => {
    it('should mark the player as cleanedUp', async () => {
      await service.cleanPlayerShip(testData.player1);

      const updatedPlayer = await prisma.player.findUniqueOrThrow({ where: { id: testData.player1.id } });
      expect(updatedPlayer.cleanedUp).toBe(true);

      // Restauramos para no afectar otros tests
      await prisma.player.update({
        where: { id: testData.player1.id },
        data: { cleanedUp: false },
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // deletePlayer
  // ─────────────────────────────────────────────────────────────────────────────

  describe('deletePlayer', () => {
    it('should delete a player from the database', async () => {
      await service.deletePlayer({ id: createdPlayer.id });

      const playerInDb = await prisma.player.findUnique({ where: { id: createdPlayer.id } });
      expect(playerInDb).toBeNull();
    });

    it('should throw P2025 if the player does not exist', async () => {
      await expect(service.deletePlayer({ id: 999999 })).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });
});