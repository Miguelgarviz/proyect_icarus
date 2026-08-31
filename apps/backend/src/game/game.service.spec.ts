import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PrismaService } from '../prisma/prisma.service';
import { Game, Prisma, Player } from '../generated/prisma/client';
import { TileService } from '../tile/tile.service';
import {
  seedTestDatabase,
  TestData,
  clearTestDatabase,
} from '../../test/test-data';

describe('GameService', () => {
  let service: GameService;
  let prisma: PrismaService;
  let tileService: TileService;
  let testData: TestData;

  let createdGame: Game;
  let testPlayer: Player;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService, PrismaService, TileService],
    }).compile();

    service = module.get<GameService>(GameService);
    prisma = module.get<PrismaService>(PrismaService);
    tileService = module.get<TileService>(TileService);

    testData = await seedTestDatabase(prisma); // 👈 una sola vez al principio
    testPlayer = testData.player3;
  });

  afterAll(async () => {
    await clearTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('GameService should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGame', () => {
    it('should create a new game', async () => {
      // Usamos lobby y player del seed, que ya existen en la BD
      const data = {
        lobby: testData.lobby2.id,
        actualPlayer: testData.player3.id,
      } as unknown as Prisma.GameCreateInput;

      const result = await service.createGame(data);

      // Verificamos el objeto devuelto
      expect(result).toBeDefined();
      expect(result.lobbyId).toBe(testData.lobby2.id);
      expect(result.actualPlayerId).toBe(testData.player3.id);
      expect(result.round).toBe(0);
      expect(result.supernovaLvL).toBe(0);

      // Verificamos que realmente existe en la BD
      const gameInDb = await prisma.game.findUnique({
        where: { id: result.id },
      });
      expect(gameInDb).not.toBeNull();

      createdGame = result;
    });

    it('should throw an error if lobby does not exist', async () => {
      const data = {
        lobby: 999999, // ID que no existe
        actualPlayer: testData.player3.id,
      } as unknown as Prisma.GameCreateInput;

      // Sin mock — Prisma lanzará el error real por FK violation
      await expect(service.createGame(data)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });

    it('should throw an error if actualPlayer does not exist', async () => {
      const data = {
        lobby: testData.lobby2.id,
        actualPlayer: 999999, // ID que no existe
      } as unknown as Prisma.GameCreateInput;

      await expect(service.createGame(data)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe('getGame', () => {
    it('should get a game by its ID', async () => {
      const result = await service.getGame({ id: testData.game.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(testData.game.id);
      expect(result.lobbyId).toBe(testData.lobby1.id);
      expect(result.actualPlayerId).toBe(testData.player1.id);
      expect(result.storeId).toBe(testData.store1.id);
      expect(result.round).toBe(0);
      expect(result.supernovaLvL).toBe(0);
    });

    it('should return PrismaError if the game does not exist', async () => {
      await expect(service.getGame({ id: 999999 })).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  describe('updateGame', () => {
    const updateData = {
      round: 2,
      supernovaLvL: 1,
    };
    it('should update a game with the provided data', async () => {
      const result = await service.updateGame({
        data: updateData,
        where: { id: testData.game.id },
      });

      expect(result).toBeDefined();
      expect(result.round).toBe(updateData.round);
      expect(result.supernovaLvL).toBe(updateData.supernovaLvL);
    });

    it('should throw Prisma error if the game does not exist', async () => {
      await expect(
        service.updateGame({ data: updateData, where: { id: 999999 } }),
      ).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  describe('setGameStore', () => {
    it('should assign a store to a game', async () => {
      await service.setGameStore({ id: createdGame.id }, testData.store2.id);

      const updatedGame = await service.getGame({ id: createdGame.id });
      expect(updatedGame.storeId).toBe(testData.store2.id);

      createdGame = updatedGame;
    });

    it('should throw Prisma error if the game does not exist', async () => {
      await expect(
        service.setGameStore({ id: 99999999 }, testData.store2.id),
      ).rejects.toMatchObject({
        code: 'P2025',
      });
    });
  });

  describe('getStoreByGame', () => {
    it('should return the store associated with the game', async () => {
      const store = await service.getStoreByGame(testData.game);
      expect(store).toBeDefined();
      expect(store.id).toBe(testData.store1.id);
    });
  });

  describe('nextPlayer', () => {
    it('should reset player movement to ship engine value', async () => {
      await service.nextPlayer(testData.player2, testData.game, testData.ship2);

      const updatedPlayer = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player2.id },
      });
      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: testData.ship2.id },
      });
      const updatedGame = await prisma.game.findUniqueOrThrow({
        where: { id: testData.game.id },
      });

      expect(updatedPlayer.movement).toBe(testData.ship2.engine);
      expect(updatedGame.actualPlayerId).toBe(testData.player2.id);
      expect(updatedShip.engineUpgraded).toBe(false);
    });
  });

  describe('upgradeShield', () => {
    it('should increase ship shield by one', async () => {
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: testPlayer.shipId! },
      });
      const storage = await prisma.storage.findUniqueOrThrow({
        where: { id: testPlayer.storageId! },
      });

      await service.upgradeShield(ship, storage);

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: ship.id },
      });
      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: storage.id },
      });

      expect(updatedShip.shield).toBe(ship.shield + 1);
      expect(updatedStorage.green).toBe(storage.green - 1);
    });
  });

  describe('upgradeDrill', () => {
    it('should increase ship drill by one', async () => {
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: testPlayer.shipId! },
      });
      const storage = await prisma.storage.findUniqueOrThrow({
        where: { id: testPlayer.storageId! },
      });

      await service.upgradeDrill(ship, storage);

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: ship.id },
      });
      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: storage.id },
      });

      expect(updatedShip.drill).toBe(ship.drill + 1);
      expect(updatedStorage.green).toBe(storage.green - 1);
    });
  });

  describe('upgradeEngine', () => {
    it('should increase ship engine by one', async () => {
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: testPlayer.shipId! },
      });
      const storage = await prisma.storage.findUniqueOrThrow({
        where: { id: testPlayer.storageId! },
      });

      await service.upgradeEngine(ship, storage);

      const updatedShip = await prisma.ship.findUniqueOrThrow({
        where: { id: ship.id },
      });
      const updatedStorage = await prisma.storage.findUniqueOrThrow({
        where: { id: storage.id },
      });

      expect(updatedShip.engine).toBe(ship.engine + 1);
      expect(updatedStorage.red).toBe(storage.red - 1);
    });
  });

  describe('increaseSupernovaLvL', () => {
    it('should increase supernova level by one', async () => {
      await service.increaseSupernovaLvL(createdGame);

      const updatedGame = await prisma.game.findUniqueOrThrow({
        where: { id: createdGame.id },
      });
      expect(updatedGame.supernovaLvL).toBe(createdGame.supernovaLvL + 1);

      createdGame = updatedGame;
    });
  });

  describe('haveAchivedGoal', () => {
    it('should return true when all required resources are reached', async () => {
      const storage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.player1.storageId! },
      });
      const goal = service.haveAchivedGoal(testData.lobby1, storage);

      expect(goal).toBeDefined();
      expect(goal).toBe(true);
    });

    it('should return false when green requirement is not met', async () => {
      const storage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.player3.storageId! },
      });
      const goal = service.haveAchivedGoal(testData.lobby2, storage);

      expect(goal).toBeDefined();
      expect(goal).toBe(false);
    });

    it('should return true when requirement is are met with surpluses', async () => {
      const storage = await prisma.storage.findUniqueOrThrow({
        where: { id: testData.player2.storageId! },
      });
      const goal = service.haveAchivedGoal(testData.lobby1, storage);

      expect(goal).toBeDefined();
      expect(goal).toBe(true);
    });
  });

  describe('movePlayer', () => {
    it('valid movement in the same orbit without other players in the way', async () => {
      const tile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        0,
      );
      await service.movePlayer(tile, testData.player1, testData.ship1);

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: player.shipId! },
      });
      const startTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        2,
        0,
      );
      const endTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        0,
      );
      expect(player.movement).toBe(2);
      expect(ship.externalId).toBe('space_station_2');
      expect(ship.positionX).toBe(0);
      expect(ship.positionY).toBe(testData.ship1.positionY);
      expect(startTile.ocupiedByPlayerId).toBeNull();
      expect(endTile.ocupiedByPlayerId).toBeDefined();

      await prisma.player.update({
        data: {
          movement: ship.engine,
        },
        where: { id: player.id },
      });
    });
    it('valid movement in diferent orbits with other players in the way', async () => {
      const tile = await tileService.getTilesByCoordinates(
        testData.game.id,
        1,
        1,
      );

      const pl = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const sh = await prisma.ship.findUniqueOrThrow({
        where: { id: pl.shipId! },
      });

      await service.movePlayer(tile, pl, sh);

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: player.shipId! },
      });
      const startTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        0,
      );
      const landingTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        1,
      );
      const endTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        1,
        1,
      );

      expect(player.movement).toBe(1);
      expect(ship.externalId).toBe('red_planet_3');
      expect(ship.positionX).toBe(1);
      expect(ship.positionY).toBe(1);
      expect(startTile.ocupiedByPlayerId).toBeNull();
      expect(startTile.externalId).toMatch('space_station');
      expect(landingTile.externalId).toBe('red_planet_1');
      expect(landingTile.ocupiedByPlayerId).toBe(testData.player2.id);
      expect(endTile.ocupiedByPlayerId).toBe(testData.player1.id);

      await prisma.player.update({
        data: {
          movement: ship.engine,
        },
        where: { id: player.id },
      });
    });

    it('valid movement in same orbit with other players in the way and backwards', async () => {
      const tile = await tileService.getTilesByCoordinates(
        testData.game.id,
        15,
        1,
      );

      const pl = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const sh = await prisma.ship.findUniqueOrThrow({
        where: { id: pl.shipId! },
      });

      await service.movePlayer(tile, pl, sh);

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: player.shipId! },
      });
      const startTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        1,
        1,
      );
      const endTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        15,
        1,
      );

      expect(player.movement).toBe(1);
      expect(ship.externalId).toBe('green_planet_7');
      expect(ship.positionX).toBe(15);
      expect(ship.positionY).toBe(1);
      expect(startTile.ocupiedByPlayerId).toBeNull();
      expect(endTile.ocupiedByPlayerId).toBe(testData.player1.id);
    });

    it('invalid movement in same orbit without enough movement points', async () => {
      const tile = await tileService.getTilesByCoordinates(
        testData.game.id,
        12,
        1,
      );

      const pl = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const sh = await prisma.ship.findUniqueOrThrow({
        where: { id: pl.shipId! },
      });

      await service.movePlayer(tile, pl, sh);

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: player.shipId! },
      });
      const startTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        15,
        1,
      );
      const endTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        12,
        1,
      );

      expect(player.movement).toBe(1);
      expect(ship.externalId).toBe('green_planet_7');
      expect(ship.positionX).toBe(15);
      expect(ship.positionY).toBe(1);
      expect(startTile.ocupiedByPlayerId).toBe(testData.player1.id);
      expect(endTile.ocupiedByPlayerId).toBeNull();
    });

    it('invalid movement if other player is in the same tile', async () => {
      const tile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        1,
      );

      const pl = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const sh = await prisma.ship.findUniqueOrThrow({
        where: { id: pl.shipId! },
      });

      await service.movePlayer(tile, pl, sh);

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: player.shipId! },
      });
      const startTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        15,
        1,
      );
      const endTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        1,
      );

      expect(player.movement).toBe(1);
      expect(ship.externalId).toBe('green_planet_7');
      expect(ship.positionX).toBe(15);
      expect(ship.positionY).toBe(1);
      expect(startTile.ocupiedByPlayerId).toBe(testData.player1.id);
      expect(endTile.ocupiedByPlayerId).toBe(testData.player2.id);
    });

    it('invalid movement if trying to change orbit without a space station', async () => {
      const tile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        0,
      );

      const pl = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const sh = await prisma.ship.findUniqueOrThrow({
        where: { id: pl.shipId! },
      });

      await service.movePlayer(tile, pl, sh);

      const player = await prisma.player.findUniqueOrThrow({
        where: { id: testData.player1.id },
      });
      const ship = await prisma.ship.findUniqueOrThrow({
        where: { id: player.shipId! },
      });
      const startTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        15,
        1,
      );
      const endTile = await tileService.getTilesByCoordinates(
        testData.game.id,
        0,
        0,
      );

      expect(player.movement).toBe(1);
      expect(ship.externalId).toBe('green_planet_7');
      expect(ship.positionX).toBe(15);
      expect(ship.positionY).toBe(1);
      expect(startTile.ocupiedByPlayerId).toBe(testData.player1.id);
      expect(endTile.ocupiedByPlayerId).toBeNull();
    });
  });
});
